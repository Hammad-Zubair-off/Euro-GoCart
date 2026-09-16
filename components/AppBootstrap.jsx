'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setProduct } from '@/lib/features/product/productSlice';
import { setCart } from '@/lib/features/cart/cartSlice';
import { setAddresses } from '@/lib/features/address/addressSlice';
import { api } from '@/lib/api';
import { useAuth } from './AuthProvider';
import LoginModal from './LoginModal';

function cartTotal(cartItems) {
  return Object.values(cartItems || {}).reduce((sum, qty) => sum + Number(qty || 0), 0);
}

export default function AppBootstrap({ children }) {
  const dispatch = useDispatch();
  const { isLoggedIn, loading: authLoading } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api('/products?limit=100');
        const items = (data.items || []).map((p) => ({
          ...p,
          rating: p.rating || [],
        }));
        dispatch(setProduct(items));
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };
    loadProducts();
  }, [dispatch]);

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      dispatch(setCart({ cartItems: {}, total: 0 }));
      dispatch(setAddresses([]));
      return;
    }

    const hydrate = async () => {
      try {
        const [cartData, addresses] = await Promise.all([
          api('/cart', { auth: true }),
          api('/addresses', { auth: true }),
        ]);
        const cartItems = cartData.cartItems || {};
        dispatch(setCart({ cartItems, total: cartTotal(cartItems) }));
        dispatch(setAddresses(addresses || []));
      } catch (err) {
        console.error('Failed to hydrate user data', err);
      }
    };
    hydrate();
  }, [isLoggedIn, authLoading, dispatch]);

  return (
    <>
      {children}
      <LoginModal />
    </>
  );
}
