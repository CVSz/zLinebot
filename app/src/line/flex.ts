type Product = {
  id: number;
  name: string;
  price: string;
};

export function flex(products: Product[]) {
  return {
    type: "carousel",
    contents: products.map((item) => ({
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: item.name, weight: "bold" },
          { type: "text", text: `${item.price} THB` }
        ]
      }
    }))
  };
}

export function flexText(text: string) {
  return { type: "text", text };
}
