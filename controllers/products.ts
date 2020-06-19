import { Client } from "https://deno.land/x/postgres/mod.ts";
import { Product } from '../types.ts';
import { dbCredentials } from '../config.ts';

//Init Client
const client = new Client(dbCredentials);

// @productsDTO: Transforms the object result from DB into a readble array of objects
const productsDTO: any = (result: any) => {
    return result.rows.map( (p: any) => {
        let object: any = {};
        result.rowDescription.columns.forEach((el: any, i: number) => {
            object[el.name] = p[i];
        })
        return object;
    })
}

// @responseCreator: Create REST APi's reponses 
const responseCreator: any = (response: any, status: number, success: boolean, body: string | any) => {
    let object: any = { success };
    if (typeof body === 'string') {
        object = {...object, msg: body}
    } else {
        object = {...object, data: body}
    }
    response.status = status;
    response.body = object;
}


// Get all products
// GET /api/v1/products/
const getProducts = async ({response}: {response: any}) => {
    try {
        await client.connect();
        const result = await client.query("SELECT * FROM products");
        const products: Product[] = productsDTO(result);
        responseCreator(response, 200, true, products);      
    } catch (err) {
        responseCreator(response, 500, false, err.toString());
    } finally {
        await client.end();
    }
}

// Get single product
// GET /api/v1/products/:id
const getProduct = async ({params, response}: {params: {id: string}, response: any}) => {
    try {
        
        await client.connect();
        const result = await client.query("SELECT * FROM products WHERE id = $1",
            params.id);
        if (result.rows.toString() === '') {
            responseCreator(response, 404, false, `No product of the id of ${params.id}`);  
        } else {
            const product: Product = productsDTO(result)[0];
            responseCreator(response, 200, true, product); 
        }
    } catch (err) {
        responseCreator(response, 500, false, err.toString());
    } finally {
        await client.end();
    }
}

// Add product
// POST /api/v1/products/:id
const addProduct = async ({request,response}: { request: any, response: any}) => {
    const body = await request.body();
    const product: Product = body.value;
    if (!request.hasBody) {
        responseCreator(response, 400, false, 'No data');
    } else {
        try {
            await client.connect();
            await client.query('INSERT INTO products(name, description,price) VALUES($1,$2,$3)', 
                product.name, 
                product.description, 
                product.price)
            responseCreator(response, 201, true, product);
        } catch(err) {
            responseCreator(response, 500, false, err.toString());
        } finally {
            await client.end();
        }
    }
}

// Update product
// PUT /api/v1/products/:id
const updateProduct = async ({params, request,response}: {params: {id: string}, request: any, response: any}) => {
    await getProduct({ params: { "id" : params.id}, response});
    if (response.status === 404) {
        responseCreator(response, 404, false, `No product of the id of ${params.id}`);  
    } else {
        const body = await request.body();
        const product: Product = body.value;
        if (!request.hasBody) {
            responseCreator(response, 400, false, 'No data');
        } else {
            try {
                await client.connect();
                await client.query('UPDATE products SET name=$1, description=$2, price=$3 WHERE id=$4', 
                    product.name, 
                    product.description, 
                    product.price,
                    params.id)
                responseCreator(response, 200, true, product);
            } catch(err) {
                responseCreator(response, 500, false, err.toString());
            } finally {
                await client.end();
            }
        }
    }
}

// Delete product
// DELETE /api/v1/products/:id
const deleteProduct = async ({params,response}: {params: {id: string},response: any}) => {
    await getProduct({ params: { "id" : params.id}, response});
    if (response.status === 404) {
        responseCreator(response, 404, false, `No product of the id of ${params.id}`);  
    } else {
        try {
            await client.connect()
            await client.query("DELETE FROM products WHERE id=$1", 
                params.id)
            responseCreator(response, 200, true, `Product with id ${params.id} has been deleted`);  
        } catch(err) {
            responseCreator(response, 500, false, err.toString());
        } finally {
            await client.end();
        }
    }
}

export {  
    getProducts, 
    getProduct, 
    addProduct, 
    updateProduct, 
    deleteProduct 
}
