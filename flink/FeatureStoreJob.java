import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Properties;
import org.apache.flink.api.common.state.ValueState;
import org.apache.flink.api.common.state.ValueStateDescriptor;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.streaming.api.CheckpointingMode;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.KeyedProcessFunction;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaProducer;
import org.apache.flink.util.Collector;

public class FeatureStoreJob {
  private static final ObjectMapper MAPPER = new ObjectMapper();

  public static void main(String[] args) throws Exception {
    StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
    env.enableCheckpointing(10_000, CheckpointingMode.EXACTLY_ONCE);

    String bootstrap = envOrDefault("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092");
    String inputTopic = envOrDefault("KAFKA_INPUT_TOPIC", "events");
    String outputTopic = envOrDefault("KAFKA_FEATURES_TOPIC", "features_online");

    DataStream<JsonNode> events = source(env, bootstrap, inputTopic);

    DataStream<String> aggregated = events
      .keyBy(event -> event.path("userId").asText("unknown"))
      .process(new UserFeatureProcess())
      .map(JsonNode::toString);

    aggregated.addSink(sink(bootstrap, outputTopic));

    env.execute("feature-store-job");
  }

  private static DataStream<JsonNode> source(StreamExecutionEnvironment env, String bootstrap, String topic) {
    Properties props = new Properties();
    props.setProperty("bootstrap.servers", bootstrap);
    props.setProperty("group.id", "feature-store-job");

    FlinkKafkaConsumer<String> consumer = new FlinkKafkaConsumer<>(topic, new SimpleStringSchema(), props);
    return env.addSource(consumer).map(raw -> MAPPER.readTree(raw));
  }

  private static FlinkKafkaProducer<String> sink(String bootstrap, String topic) {
    Properties props = new Properties();
    props.setProperty("bootstrap.servers", bootstrap);
    props.setProperty("transaction.timeout.ms", "900000");
    return new FlinkKafkaProducer<>(topic, new SimpleStringSchema(), props);
  }

  private static String envOrDefault(String key, String fallback) {
    String value = System.getenv(key);
    return (value == null || value.isBlank()) ? fallback : value;
  }

  static final class UserFeatureProcess extends KeyedProcessFunction<String, JsonNode, JsonNode> {
    private transient ValueState<UserFeatures> state;

    @Override
    public void open(org.apache.flink.configuration.Configuration parameters) {
      ValueStateDescriptor<UserFeatures> descriptor =
        new ValueStateDescriptor<>("user-features", UserFeatures.class);
      state = getRuntimeContext().getState(descriptor);
    }

    @Override
    public void processElement(JsonNode event, Context context, Collector<JsonNode> collector) throws Exception {
      UserFeatures features = state.value();
      if (features == null) {
        features = new UserFeatures();
      }

      features.count += 1;
      features.lastTs = event.path("ts").asLong(System.currentTimeMillis());

      state.update(features);

      ObjectNode output = MAPPER.createObjectNode();
      output.put("userId", context.getCurrentKey());
      output.put("count", features.count);
      output.put("lastTs", features.lastTs);
      collector.collect(output);
    }
  }

  public static class UserFeatures {
    public long count = 0;
    public long lastTs = 0;
  }
}
