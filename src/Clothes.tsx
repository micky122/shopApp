import { useState, useEffect, ChangeEvent, DragEvent } from 'react';

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
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Cancel upload image
  const [xhrInstance, setXhrInstance] = useState<XMLHttpRequest | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  

  useEffect(() => {
    calculatePrice();
  }, [product, color, material, text, image]);

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

    // img preview
    if(file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  /** ------Img drag&drop------ */
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if(file&&file.type.startsWith('image/')) {
      setImage(file);
      // img preview
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }

  const handleDragLeave = () => setIsDragging(false);

  /** ------End drag&drop------ */

  const handleSubmit = async (): Promise<void> => {
    if(window.confirm("Are you sure?")) {

      const formData = new FormData();
      formData.append('product', product);
      formData.append('color', color);
      formData.append('material', material);
      formData.append('text', text);
      formData.append('price', price.toString());
      if (image) formData.append('image', image);
      
      const xhr = new XMLHttpRequest();
      setXhrInstance(xhr);
      setUploading(true);
      // xhr.open('POST', 'ht')
      try {
        const response = await fetch('http://localhost:8080/api/order', {
          method: 'POST',
          body: formData,
        });
        if(response.ok) {
          alert("Order submitted!");
        } else {
          alert("Failed to submit order");
        }
      } catch(error) {
        alert("An error occurred during upload.")
      }
      alert('Order submitted!');
    } else {
      return ;
    }
    };

  const cancelUpload = () => {
    if(xhrInstance) {
      xhrInstance.abort();
      setUploading(false);
      setXhrInstance(null);
      alert('Uploading canceled');
    }
  }
  return (
    <div className=" p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6">
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
        <div 
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full p-4 border-2 border-dashed rounded text-center cursor-pointer transition-colors ${isDragging ? 'bg-blue-50 border-blue-400' : 'border-gray-300'}`}
        > 
          <p className="text-sm text-gray-500">Drag & drop image here, or click to select file</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id='fileInput'
            // className="w-full p-2 border rounded cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <label htmlFor="fileInput" className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white text-sm rounded cursor-pointer hover:bg-blue-600">
            Browse
          </label>
        </div>
        {image && <p className="text-sm text-green-600 mt-1">Selected: {image.name}</p>}
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="mt-2 w-full h-auto rounded border border-gray-300" />
        )}
        {uploading && (
          <button 
            onClick={cancelUpload}
            className="mt-2 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
            Cancel Upload
          </button>
        )

        }
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={calculatePrice}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Calculate Price
        </button>
        {/* <span className="text-lg font-bold">Price: ${price.toFixed(2)}</span> */}
        <span className="text-lg font-bold">Price: {price}</span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={uploading}
        className="border border-slate-300 hover:border-slate-400 w-full bg-green-600 text-white p-3 rounded mt-4 hover:bg-green-700"
      >
        {uploading ? 'Uploading...' : 'Submit Order'}
      </button>
    </div>
  );
}
