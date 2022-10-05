/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCollectionData, useDocument } from 'react-firebase-hooks/firestore';
import { useParams } from 'react-router-dom';
import db, { collection, doc } from '../../../../../configs/firebase';
import ErrorDialog from '../../../../ui/ErrorDialog';
import LoadingOverlay from '../../../../ui/LoadingOverlay';
import ItemList from '../../../../ui/ItemList';
import { Store } from '../../../../ui/StoreCard';
import { Item } from '../../../../ui/ItemCard';

const PublicItems = () => {
  const { storeId } = useParams();
  const [storeDoc, storeDocLoading, storeDocError] = useDocument(doc(db, `stores/${storeId ?? ''}`), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [itemCollectionData, itemCollectionDataLoading, itemCollectionDataError] = useCollectionData(
    collection(db, `/stores/${storeId ?? ''}/items`),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );

  // useEffect(() => {
  //   console.log(itemCollectionData);
  // }, [itemCollectionData]);

  return (
    <div>
      <h2>商品一覧</h2>
      <ItemList store={storeDoc?.data() as Store} items={itemCollectionData as Item[]} />
      <LoadingOverlay open={storeDocLoading || itemCollectionDataLoading} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
      <ErrorDialog open={!!itemCollectionDataError} error={itemCollectionDataError} />
    </div>
  );
};

export default PublicItems;