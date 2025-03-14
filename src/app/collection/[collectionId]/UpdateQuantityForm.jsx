import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';

export function UpdateQuantityForm({ setNum, collectionId, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const initQuantity = useQuery(api.collection.getCollectionSetQuantity, {
    collectionId,
    setNum,
  });
  const updateQuantity = useMutation(api.collection.updateCollectionQuantity);

  useEffect(() => {
    if (initQuantity !== undefined) {
      setQuantity(initQuantity);
    }
  }, [initQuantity]);

  const handleUpdateQuantity = async () => {
    try {
      await updateQuantity({ collectionId, setNum, quantity });
      toast.success('Quantity updated successfully!');
      onClose?.();
    } catch (error) {
      toast.error('Something went wrong: ' + error.message);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Set Quantity</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <Label>Quantity</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full"
            min={1}
          />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-blue-900 hover:bg-blue-500"
            onClick={handleUpdateQuantity}
          >
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateQuantityForm;
