import type { IncomingMessage, ServerResponse } from "http";
import { insertProduct, readProduct } from "../service/product.service";
import type { IProduct } from "../types/product.type";
import { parseBody } from "../utility/parseBody";

export const productController = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  // console.log("Request", req);
  // console.log("Route hit");
  const url = req.url;
  const method = req.method;
  // /products => /products/1 => ['', 'products', '1']

  const urlParts = url?.split("/");
  // console.log(urlParts);
  const id =
    urlParts && urlParts[1] === "products" ? Number(urlParts[2]) : null;
  // console.log("This is the actual id: ", id);

  // GET All Products
  if (url === "/products" && method === "GET") {
    // const products = [
    //   {
    //     id: 1,
    //     name: "Product - 1",
    //   },
    // ];
    const products = readProduct();
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Products retrived successfully",
        data: products,
      }),
    );
  } else if (method === "GET" && id != null) {
    // Get single products with id
    const products = readProduct();
    const product = products.find((p: IProduct) => p.id === id);
    // console.log(product);
    res.end(
      JSON.stringify({
        message: "Product retrived successfully",
        data: product,
      }),
    );
  } else if (method === "POST" && url === "/products") {
    // created product by POST method
    const body = await parseBody(req);
    const products = readProduct(); // [{}, {}, {}]
    /**
     * The body we get from Postman via calling a function which takes IncomingMessage (s) as chunk of inputs and returns the whole IncomingMessage. chunk of IncomingMessage from parseBody.
     * {
            "name": "Product Test",
            "description": "Product description",
            "price": 3500
        }
     */
    // console.log("Body", body);
    const newProduct = {
      id: Date.now(),
      ...body,
    };
    // console.log(newProduct);
    products.push(newProduct); //[{}, {}, {}, {new}]
    // console.log(products);
    insertProduct(products);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Products created successfully",
        data: newProduct,
      }),
    );
  } else if (method === "PUT" && id !== null) {
    const body = await parseBody(req);
    const products = readProduct();

    const index = products.findIndex((p: IProduct) => p.id === id);
    if (index < 0) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Product Not Found",
          data: null,
        }),
      );
    }

    // console.log(products[index]);
    // UPDATED THE PRODUCT BY PUT METHOD
    products[index] = { id: products[index].id, ...body };

    // WRITE THE PRODUCT IN THE DATABASE
    insertProduct(products);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Product Updated Successfully",
        data: products[index],
      }),
    );
  }
};
