'use client'
import { addToCart, removeFromCart, setCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import toast from "react-hot-toast";

function cartTotal(cartItems) {
    return Object.values(cartItems || {}).reduce((sum, qty) => sum + Number(qty || 0), 0);
}

const Counter = ({ productId }) => {

    const { cartItems } = useSelector(state => state.cart);
    const dispatch = useDispatch();
    const { requireAuth } = useAuth();

    const addToCartHandler = async () => {
        if (!requireAuth()) return;
        try {
            dispatch(addToCart({ productId }))
            const data = await api('/cart/add', { method: 'POST', auth: true, body: { productId, quantity: 1 } })
            dispatch(setCart({ cartItems: data.cartItems, total: cartTotal(data.cartItems) }))
        } catch (err) {
            toast.error(err.message || 'Failed')
        }
    }

    const removeFromCartHandler = async () => {
        if (!requireAuth()) return;
        try {
            dispatch(removeFromCart({ productId }))
            const data = await api('/cart/decrease', { method: 'POST', auth: true, body: { productId } })
            dispatch(setCart({ cartItems: data.cartItems, total: cartTotal(data.cartItems) }))
        } catch (err) {
            toast.error(err.message || 'Failed')
        }
    }

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button onClick={removeFromCartHandler} className="p-1 select-none">-</button>
            <p className="p-1">{cartItems[productId]}</p>
            <button onClick={addToCartHandler} className="p-1 select-none">+</button>
        </div>
    )
}

export default Counter
