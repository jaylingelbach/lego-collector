'use client';

import { useRouter } from 'next/navigation';
import { api } from '../../../convex/_generated/api';
import { AddCollectionForm } from './AddCollectionForm';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RemoveDialog } from '@/components/remove-dialog';
import { MoreVertical, TrashIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Home = () => {
  const { user } = useUser();
  const collections = useQuery(api.collection.getUserCollections) || [];
  const router = useRouter();
  const handleViewClick = (collectionId) => {
    router.push(`/collection/${collectionId}`);
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <Card className="w-full max-w-4xl p-6 shadow-lg">
        <CardHeader>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome, {user.firstName}!
          </h1>
        </CardHeader>

        <CardContent>
          <AddCollectionForm />

          {collections.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Collections
              </h2>
              <ul className="mt-2 space-y-2">
                {collections.map((collection) => (
                  <li
                    key={collection._id}
                    className="p-4 bg-gray-100 rounded-lg shadow-sm flex justify-between items-center"
                  >
                    <span className="text-lg text-gray-800">
                      {collection.name}
                    </span>
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="bg-blue-900 hover:bg-blue-500 cursor-pointer text-white"
                        onClick={() => handleViewClick(collection._id)}
                      >
                        View
                      </Button>
                      <DropdownMenu>
                        {/* as child needed to render button */}
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <MoreVertical className="size-6" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <RemoveDialog collectionId={collection._id}>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <TrashIcon className="size-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </RemoveDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-6 text-center text-gray-600">
              <h2 className="text-lg font-semibold">No collections yet</h2>
              <p className="mt-2">
                Start by adding a collection to organize your LEGO sets.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
