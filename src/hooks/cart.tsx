import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsInCart = await AsyncStorage.getItem('cartProduct');
      if (productsInCart) {
        setProducts(JSON.parse(productsInCart));
      } else setProducts([]);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productAlreadyInCart = products.find(productsInCart => {
        return productsInCart.id === product.id;
      });

      if (!productAlreadyInCart) {
        product.quantity = 1;
        setProducts([...products, product]);

        await AsyncStorage.setItem(
          'cartProduct',
          JSON.stringify([...products, product]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIncrement: Product[] = products.map(product => {
        if (id === product.id) {
          product.quantity += 1;
          return product;
        }
        return product;
      });

      setProducts(productIncrement);
      await AsyncStorage.setItem(
        'cartProduct',
        JSON.stringify(productIncrement),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productDecrement = products.map(product => {
        if (id === product.id) {
          product.quantity -= 1;
          return product;
        }
        return product;
      });

      setProducts(productDecrement);

      await AsyncStorage.setItem(
        'cartProduct',
        JSON.stringify(productDecrement),
      );
    },

    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
