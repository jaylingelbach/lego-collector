'use client';

import { api } from '../../../../convex/_generated/api';
import { useQuery } from 'convex/react';
import { CollectionTable } from './CollectionTable';
import SearchSet from './SearchSet';
import { useParams } from 'next/navigation';
import FullscreenLoader from '@/components/fullscreen-loader';

const Collection = () => {
  const { collectionId } = useParams();
  const collection = useQuery(api.collection.getCollectionById, {
    collectionId,
  });
  if (!collection) return <FullscreenLoader fallback="Loading collection..." />;
  const collectionName = collection?.name || 'My Collection';
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          {collectionName}
        </h1>
        <SearchSet />
        <CollectionTable />
      </div>
    </div>
  );
};

export default Collection;
