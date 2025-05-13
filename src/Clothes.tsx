import { useState, ChangeEvent } from 'react';

interface Order {
  product: 'tshirt' | 'sweater';
  color: string;
  material: 'light' | 'heavy';
  text: string;
  image?: File | null;
  price: number;
}

export default function Clothes() {
  const [product, setProduct] = useState<Order['product']>('tshirt');
  const [color, setColor] = useState<string>('black');
  const [material, setMaterial] = useState<Order['material']>('light');
  const [text, setText] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [price, setPrice] = useState<number>(0);

  const calculatePrice = (): void => {
    let basePrice = 0;

    if (product === 'tshirt') {
      basePrice = ['black', 'white'].includes(color) ? 16.95 : 18.95;
      if (material === 'heavy') basePrice += 3;
    } else if (product === 'sweater') {
      basePrice = ['black', 'white'].includes(color) ? 28.95 : 32.95;
    }

    if (text.length > 8) basePrice += 5;
    if (image) basePrice += 10;

    setPrice(basePrice);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
  };

  const handleSubmit = async (): Promise<void> => {
    const formData = new FormData();
    formData.append('product', product);
    formData.append('color', color);
    formData.append('material', material);
    formData.append('text', text);
    formData.append('price', price.toString());
    if (image) formData.append('image', image);

    await fetch('http://localhost:3000/api/order', {
      method: 'POST',
      body: formData,
    });
    alert('Order submitted!');
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center">T-Shirt Designer</h1>

      <div>
        <label className="block font-medium mb-1">Product</label>
        <select
          className="w-full p-2 border rounded"
          value={product}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setProduct(e.target.value as Order['product'])}
        >
          <option value="tshirt">T-Shirt</option>
          <option value="sweater">Sweater</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Color</label>
        <select
          className="w-full p-2 border rounded"
          value={color}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setColor(e.target.value)}
        >
          {product === 'tshirt' ? (
            <>
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
            </>
          ) : (
            <>
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="pink">Pink</option>
              <option value="yellow">Yellow</option>
            </>
          )}
        </select>
      </div>

      {product === 'tshirt' && (
        <div>
          <label className="block font-medium mb-1">Material</label>
          <select
            className="w-full p-2 border rounded"
            value={material}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setMaterial(e.target.value as Order['material'])}
          >
            <option value="light">Light Cotton</option>
            <option value="heavy">Heavy Cotton (+$3)</option>
          </select>
        </div>
      )}

      <div>
        <label className="block font-medium mb-1">Text (First 8 chars free, +$5 for 9–16)</label>
        <input
          className="w-full p-2 border rounded"
          type="text"
          maxLength={16}
          value={text}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Upload Image (+$10)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full p-2 border rounded cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={calculatePrice}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Calculate Price
        </button>
        <span className="text-lg font-bold">Price: ${price.toFixed(2)}</span>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white p-3 rounded mt-4 hover:bg-green-700"
      >
        Submit Order
      </button>
    </div>
  );
}
