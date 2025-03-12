import { React, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
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

export function AddCollectionForm() {
  const addCollection = useMutation(api.collection.addCollection);
  const [name, setName] = useState('');
  const [setNum, setSetNum] = useState('');
  const [collectionId, setCollectionId] = useState(''); // Tracks selected collection
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  const handleAddCollection = async () => {
    if (!newCollectionName.trim()) {
      setError('Collection name is required.');
      inputRef.current?.focus();
      return;
    }
    setError('');
    const newId = await addCollection({ name: newCollectionName.trim() });
    setCollectionId(newId);
    setNewCollectionName('');
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setError('');
        }
      }}
    >
      <DialogTrigger asChild>
        <div className="flex justify-end">
          <Button className="bg-blue-900 hover:bg-blue-500 cursor-pointer">
            Add a collection
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a LEGO Collection</DialogTitle>
          Add a collection to your profile. It can be just a general collection
          like "LEGO" or something more specific like "Star Wars" or "Technic".
          Once you create a collection you can add sets to it.
        </DialogHeader>

        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Name of your collection"
                onChange={(e) => setNewCollectionName(e.target.value)}
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>
        </form>

        <Button variant="outline">Cancel</Button>
        <Button
          className="bg-blue-900 hover:bg-blue-500 cursor-pointer"
          onClick={handleAddCollection}
        >
          Add
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default AddCollectionForm;
