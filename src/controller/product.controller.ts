import type { IncomingMessage, ServerResponse } from "http";
import { insertProduct, readProduct } from "../service/product.service";
import type { IProduct } from "../types/product.type";
import { parseBody } from "../utility/parseBody";
import { sendResponse } from "../utility/sendResponse";

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

    try {
      return sendResponse(
        res,
        200,
        true,
        "Products retrived successfully",
        products,
      );
    } catch (error) {
      return sendResponse(res, 500, false, "Something went wrong", error);
    }
  } else if (method === "GET" && id != null) {
    // Get single products with id
    const products = readProduct();
    const product = products.find((p: IProduct) => p.id === id);
    // console.log(product);

    // If Product is not in the database:
    if (!product) {
      return sendResponse(res, 404, false, "Product Not Found");
    }
    try {
      return sendResponse(
        res,
        200,
        true,
        "Products retrived successfully",
        product,
      );
    } catch (error) {
      return sendResponse(res, 404, false, "Product not found", error);
    }
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
    try {
      return sendResponse(
        res,
        200,
        true,
        "Product Created Successfully",
        newProduct,
      );
    } catch (error) {
      return sendResponse(res, 500, false, "Something went wrong", error);
    }
  } else if (method === "PUT" && id !== null) {
    const body = await parseBody(req);
    const products = readProduct();

    const index = products.findIndex((p: IProduct) => p.id === id);
    if (index < 0) {
      sendResponse(res, 404, false, "Product Not Found");
    }

    // console.log(products[index]);
    // UPDATED THE PRODUCT BY PUT METHOD
    products[index] = { id: products[index].id, ...body };

    // WRITE THE PRODUCT IN THE DATABASE
    insertProduct(products);

    try {
      return sendResponse(
        res,
        200,
        true,
        "Product Updated Successfully",
        products[index],
      );
    } catch (error) {
      sendResponse(res, 404, false, "Something Went Wrong", error);
    }
  } else if (method === "DELETE" && id !== null) {
    const products = readProduct();
    const index = products.findIndex((p: IProduct) => p.id === id);

    // if product not found
    if (index < 0) {
      sendResponse(res, 404, false, "Product Not Found");
    }

    //  DELETE the product from the array that was copied from database.
    products.splice(index, 1);
    // Write the updated product after DELETE
    insertProduct(products);

    try {
      return sendResponse(
        res,
        200,
        true,
        "Product Deleted Successfully",
        products[index],
      );
    } catch (error) {
      return sendResponse(res, 500, false, "Something Went Wrong", error);
    }
  }
};
