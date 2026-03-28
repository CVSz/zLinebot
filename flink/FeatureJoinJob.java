import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Duration;
import java.util.Properties;
import org.apache.flink.api.common.eventtime.SerializableTimestampAssigner;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.streaming.api.CheckpointingMode;
import org.apache.flink.streaming.api.datastream.ConnectedStreams;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.co.KeyedCoProcessFunction;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaProducer;
import org.apache.flink.util.Collector;

public class FeatureJoinJob {
  private static final ObjectMapper MAPPER = new ObjectMapper();

  public static void main(String[] args) throws Exception {
    final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
    env.enableCheckpointing(10_000, CheckpointingMode.EXACTLY_ONCE);

    final String bootstrap = envOrDefault("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092");

    DataStream<JsonNode> events = source(env, bootstrap, envOrDefault("KAFKA_EVENTS_TOPIC", "events"))
      .assignTimestampsAndWatermarks(
        WatermarkStrategy.<JsonNode>forBoundedOutOfOrderness(Duration.ofSeconds(10))
          .withTimestampAssigner((SerializableTimestampAssigner<JsonNode>) (event, ts) ->
            event.path("ts").asLong(System.currentTimeMillis())
          )
      );

    DataStream<JsonNode> users = source(env, bootstrap, envOrDefault("KAFKA_USER_FEATURES_TOPIC", "user_features"));
    DataStream<JsonNode> items = source(env, bootstrap, envOrDefault("KAFKA_ITEM_FEATURES_TOPIC", "item_features"));

    ConnectedStreams<JsonNode, JsonNode> eventUserConnected = events
      .keyBy(e -> eventUserKey(e))
      .connect(users.keyBy(u -> userKey(u)));

    DataStream<JsonNode> eventUserJoined = eventUserConnected.process(new UserFeatureJoinProcess());

    DataStream<JsonNode> fullyJoined = eventUserJoined
      .keyBy(FeatureJoinJob::eventItemKey)
      .connect(items.keyBy(FeatureJoinJob::itemKey))
      .process(new ItemFeatureJoinProcess());

    fullyJoined
      .map((MapFunction<JsonNode, String>) JsonNode::toString)
      .sinkTo(sink(bootstrap, envOrDefault("KAFKA_OUTPUT_TOPIC", "features")));

    env.execute("feature-join");
  }

  private static DataStream<JsonNode> source(StreamExecutionEnvironment env, String bootstrap, String topic) {
    Properties props = new Properties();
    props.setProperty("bootstrap.servers", bootstrap);
    props.setProperty("group.id", "feature-join-job");

    FlinkKafkaConsumer<String> consumer = new FlinkKafkaConsumer<>(topic, new SimpleStringSchema(), props);
    return env.addSource(consumer).map(raw -> MAPPER.readTree(raw));
  }

  private static FlinkKafkaProducer<String> sink(String bootstrap, String topic) {
    return new FlinkKafkaProducer<>(topic, new SimpleStringSchema(), kafkaProps(bootstrap));
  }

  private static Properties kafkaProps(String bootstrap) {
    Properties props = new Properties();
    props.setProperty("bootstrap.servers", bootstrap);
    props.setProperty("transaction.timeout.ms", "900000");
    return props;
  }

  private static String eventUserKey(JsonNode node) {
    return node.path("tenantId").asText() + ":" + node.path("userId").asText();
  }

  private static String userKey(JsonNode node) {
    return node.path("tenantId").asText() + ":" + node.path("userId").asText();
  }

  private static String eventItemKey(JsonNode node) {
    return node.path("tenantId").asText() + ":" + node.path("productId").asText();
  }

  private static String itemKey(JsonNode node) {
    return node.path("tenantId").asText() + ":" + node.path("productId").asText();
  }

  private static String envOrDefault(String key, String fallback) {
    String value = System.getenv(key);
    return (value == null || value.isBlank()) ? fallback : value;
  }

  static final class UserFeatureJoinProcess extends KeyedCoProcessFunction<String, JsonNode, JsonNode, JsonNode> {
    private JsonNode latestUserFeatures;

    @Override
    public void processElement1(JsonNode event, Context context, Collector<JsonNode> collector) {
      ObjectNode enriched = event.deepCopy();
      if (latestUserFeatures != null) {
        enriched.set("user_features", latestUserFeatures);
      }
      collector.collect(enriched);
    }

    @Override
    public void processElement2(JsonNode userFeatures, Context context, Collector<JsonNode> collector) {
      latestUserFeatures = userFeatures;
    }
  }

  static final class ItemFeatureJoinProcess extends KeyedCoProcessFunction<String, JsonNode, JsonNode, JsonNode> {
    private JsonNode latestItemFeatures;

    @Override
    public void processElement1(JsonNode eventWithUser, Context context, Collector<JsonNode> collector) {
      ObjectNode enriched = eventWithUser.deepCopy();
      if (latestItemFeatures != null) {
        enriched.set("item_features", latestItemFeatures);
      }
      collector.collect(enriched);
    }

    @Override
    public void processElement2(JsonNode itemFeatures, Context context, Collector<JsonNode> collector) {
      latestItemFeatures = itemFeatures;
    }
  }
}
