import { Box, Card, IconButton } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { ItemProps } from './ItemCard';
import { Order, User } from './OrderCardDetails';
import db, { auth, collection, addDoc, doc, getDoc } from '../../configs/firebase';
import LoadingOverlay from './LoadingOverlay';
import ErrorDialog from './ErrorDialog';

const ItemCardDetail = (itemProps: ItemProps) => {
  const navigate = useNavigate();
  const { store, item } = itemProps;
  const { itemId, itemName, itemPrice, itemPriceUnit, itemDescription, itemImageFile, itemStatus } = item;
  const {
    storeId,
    storeName,
    // storeEmail,
    // storePhoneNumber,
    // storeZipCode,
    // storeAddress1,
    // storeAddress2,
    // storeUrl,
    // storeSymbolAddress,
    storeDescription,
    storeImageFile,
    // storeCoverImageFile,
  } = store;
  const [authUser, authUserLoading, authUserError] = useAuthState(auth);
  const [userDocLoading, setUserDocLoading] = useState(false);
  const [userDocError, setUserDocError] = useState<Error | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!authUser) {
      return;
    }
    setUserDocLoading(true);
    const userDocRef = doc(db, `/users/${authUser.uid}`);
    getDoc(userDocRef)
      .then((userDoc) => {
        setUser(userDoc.data() as User);
      })
      .catch((error) => {
        setUserDocError(error as Error);
      })
      .finally(() => {
        setUserDocLoading(false);
      });
  }, [authUser, setUserDocLoading, setUser, setUserDocError]);

  const handleStoreAvatarClick = () => {
    navigate(`/stores/${storeId}`);
  };

  const handleItemClick = () => {
    navigate(`/stores/${storeId}/items/${itemId}`);
  };

  const handlePurchaseClick = () => {
    if (!authUser) {
      setPurchaseError(Error('??????????????????????????????????????????????????????'));
      return;
    }
    if (!user) {
      setPurchaseError(Error('???????????????????????????????????????????????????????????????'));
      return;
    }
    if (!(authUser.uid === user.userId)) {
      setPurchaseError(Error('???????????????????????????????????????????????????????????????'));
      return;
    }
    if (
      !user.userId ||
      !user.name ||
      !user.phoneNumber ||
      !user.zipCode ||
      !user.address1 ||
      !user.address2 ||
      !user.symbolAddress
    ) {
      setPurchaseError(
        Error('??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????'),
      );
      return;
    }
    const orderAmount = 1;
    const order: Order = {
      ...user,
      ...store,
      ...item,
      orderAmount,
    };
    const orderCollection = collection(db, `/users/${authUser.uid}/orders`);
    setPurchaseLoading(true);
    addDoc(orderCollection, order)
      .then((orderDocRef) => {
        navigate(`/users/${user.userId}/orders/${orderDocRef.id}`);
      })
      .catch((err) => {
        setPurchaseError(err as Error);
      })
      .finally(() => {
        setPurchaseLoading(false);
      });
  };

  return (
    <>
      <Box maxWidth="sm">
        <Card>
          <CardHeader
            avatar={<Avatar src={storeImageFile} onClick={handleStoreAvatarClick} />}
            action={
              <IconButton onClick={handleStoreAvatarClick}>
                <MoreVertIcon />
              </IconButton>
            }
            title={storeName}
            subheader={storeDescription}
          />
          <CardMedia component="img" image={itemImageFile} alt={itemName} onClick={handleItemClick} />
          <CardContent>
            <Typography gutterBottom variant="h3" component="div">
              {itemName}
            </Typography>
            <Typography variant="h4" color="text.secondary">
              {`${itemPrice.toLocaleString()} ${itemPriceUnit === 'JPY' ? '???' : ''}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {itemDescription}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="large"
              disabled={!storeId || !itemId || itemStatus === 'SOLD_OUT'}
              onClick={handlePurchaseClick}
            >
              ??????
            </Button>
          </CardActions>
        </Card>
      </Box>
      <LoadingOverlay open={authUserLoading || userDocLoading || purchaseLoading} />
      <ErrorDialog open={!!authUserError} error={authUserError} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!purchaseError} error={purchaseError} />
    </>
  );
};

export default ItemCardDetail;
