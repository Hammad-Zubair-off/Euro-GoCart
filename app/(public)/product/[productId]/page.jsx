'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState();
    const products = useSelector(state => state.product.list);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const fromRedux = products.find((p) => p.id === productId);
            if (fromRedux) {
                if (!cancelled) setProduct({ ...fromRedux, rating: fromRedux.rating || [] });
            }
            try {
                const data = await api(`/products/${productId}`);
                if (!cancelled) setProduct({ ...data, rating: data.rating || [] });
            } catch (err) {
                if (!fromRedux) console.error(err);
            }
        };

        load();
        scrollTo(0, 0);
        return () => { cancelled = true; };
    }, [productId, products]);

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>

                {product && (<ProductDetails product={product} />)}

                {product && (<ProductDescription product={product} />)}
            </div>
        </div>
    );
}
