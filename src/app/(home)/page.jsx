import { CollectionTable } from './CollectionTable';

const Home = () => {
  const collectionName = "Jay's Collection";
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          {collectionName}
        </h1>
        <CollectionTable />
      </div>
    </div>
  );
};

export default Home;
