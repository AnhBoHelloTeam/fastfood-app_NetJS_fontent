import { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
}

const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const handleQuantityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value, 10);
    if (quantity > 0) {
      await onUpdateQuantity(item._id, quantity);
    }
  };

  const handleRemove = async () => {
    await onRemove(item._id);
  };

  return (
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <h5>{item.product.name}</h5>
        <p>Giá: {item.product.price.toLocaleString('vi-VN')} VND</p>
        <p>Số lượng:
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={handleQuantityChange}
            className="form-control d-inline-block w-auto ms-2"
          />
        </p>
      </div>
      <button onClick={handleRemove} className="btn btn-danger">
        Xóa
      </button>
    </div>
  );
};

export default CartItem;