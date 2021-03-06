import { Router } from 'https://deno.land/x/oak@v5.2.0/mod.ts';
import {
    getProducts, 
    getProduct, 
    addProduct, 
    updateProduct, 
    deleteProduct
} from './controllers/products.ts'

const router = new Router();

router.get('/api/v1/products', getProducts)
router.get('/api/v1/products/:id', getProduct)
router.post('/api/v1/products', addProduct)
router.put('/api/v1/products/:id', updateProduct)
router.delete('/api/v1/products/:id', deleteProduct)

export default router;