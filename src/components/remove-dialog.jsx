'use client';

import { useState } from 'react';

import { api } from '../../convex/_generated/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';

export const RemoveDialog = ({ collectionId, children }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const remove = useMutation(api.collection.deleteCollection);
  const collections = useQuery(api.collection.getUserCollections);
  const handleRemoveClick = async (e) => {
    e.stopPropagation();
    setIsRemoving(true);
    try {
      await remove({ collectionId: collectionId });
      toast.success('Collection successfully deleted');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            collection and all of the sets within.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction disabled={isRemoving} onClick={handleRemoveClick}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
