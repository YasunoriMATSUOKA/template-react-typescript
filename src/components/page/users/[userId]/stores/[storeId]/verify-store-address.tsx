/* eslint-disable @typescript-eslint/no-misused-promises */
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Container, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, functions, httpsCallable } from '../../../../../../configs/firebase';
import LoadingOverlay from '../../../../../ui/LoadingOverlay';
import ErrorDialog from '../../../../../ui/ErrorDialog';

interface VerifyStoreAddressFormInput {
  storeAddressSecret: string;
}

interface ChallengeToVerifyStoreAddressRequest {
  userId: string;
  storeId: string;
  storeAddressSecret: string;
}

interface ChallengeToVerifyStoreAddressResponse {
  storeAddressVerified: boolean;
}

const httpsOnCallChallengeToVerifyStoreAddress = httpsCallable<
  ChallengeToVerifyStoreAddressRequest,
  ChallengeToVerifyStoreAddressResponse
>(functions, 'httpsOnCallChallengeToVerifyStoreAddress');

const schema = yup.object({
  storeAddressSecret: yup
    .string()
    .required('必須です')
    .matches(/^[0-9]{6}$/, '数字6桁で入力してください'),
});

const VerifyStoreAddress = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyStoreAddressFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const { userId, storeId } = useParams();
  const navigate = useNavigate();
  const [user, loadingUser, errorUser] = useAuthState(auth);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (loadingUser) {
      return;
    }
    if (loadingChallenge) {
      return;
    }
    if (!(user && userId && userId === user.uid)) {
      navigate('/auth/sign-in/');
      return;
    }
    if (userId !== storeId) {
      navigate(`/users/${userId}`);
    }
  });

  const onSubmit: SubmitHandler<VerifyStoreAddressFormInput> = (data) => {
    const { storeAddressSecret } = data;
    if (!userId) {
      return;
    }
    if (!storeId) {
      return;
    }
    const challengeToVerifyStoreAddressRequest: ChallengeToVerifyStoreAddressRequest = {
      userId,
      storeId,
      storeAddressSecret,
    };
    setLoadingChallenge(true);
    httpsOnCallChallengeToVerifyStoreAddress(challengeToVerifyStoreAddressRequest)
      .then((res) => {
        if (res.data.storeAddressVerified) {
          navigate(`/users/${userId}/stores/${storeId}/`);
        }
      })
      .catch((err) => {
        setError(err as Error);
      })
      .finally(() => {
        setLoadingChallenge(false);
      });
  };

  const handleCancel = () => {
    if (!userId) {
      return;
    }
    if (!storeId) {
      return;
    }
    navigate(`/users/${userId}/stores/${storeId}/`);
  };

  return (
    <>
      <Container maxWidth="sm">
        <h2>店舗住所確認</h2>
        <Stack spacing={3}>
          <TextField
            required
            label="確認コード"
            type="text"
            {...register('storeAddressSecret')}
            error={'storeAddressSecret' in errors}
            helperText={errors.storeAddressSecret?.message}
          />
          <Button color="primary" variant="contained" size="large" onClick={handleSubmit(onSubmit)}>
            確認
          </Button>
          <Button color="primary" variant="contained" size="large" onClick={handleCancel}>
            キャンセル
          </Button>
        </Stack>
      </Container>
      <LoadingOverlay open={loadingUser} />
      <LoadingOverlay open={loadingChallenge} />
      <ErrorDialog open={!!errorUser} error={errorUser} />
      <ErrorDialog open={!!error} error={error} />
    </>
  );
};

export default VerifyStoreAddress;
