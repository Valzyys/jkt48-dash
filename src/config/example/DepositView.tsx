import {
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Image,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function HomeView() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
  const [paymentPopup, setPaymentPopup] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState<boolean>(false);
  const toast = useToast();

  const webhookUrl =
    "https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C";

  useEffect(() => {
    const savedRequests = localStorage.getItem("deposit-requests");
    if (savedRequests) setDepositRequests(JSON.parse(savedRequests));
  }, []);

  const handleSubmit = async () => {
    if (!depositAmount || !phoneNumber) {
      toast({
        title: "Error",
        description: "Semua input wajib diisi!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoadingPayment(true);

      // Panggil API untuk mendapatkan QRIS dan total harga yang benar
      const response = await fetch(
        `https://api.jkt48connect.my.id/api/orkut/createpayment?amount=${depositAmount}&qris=00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214149391352933240303UMI51440014ID.CO.QRIS.WWW0215ID20233077025890303UMI5204541153033605802ID5919VALZSTORE OK14535636006SERANG61054211162070703A016304DCD2&includeFee=true&api_key=JKTCONNECT`
      );
      const data = await response.json();

      if (response.ok && data.dynamicQRIS) {
        setPaymentDetails({
          qrImageUrl: data.qrImageUrl,
          totalAmount: data.totalAmount, // Menggunakan jumlah dari API
          fee: data.fee,
          phoneNumber,
          depositAmount,
        });

        setPaymentPopup(true);
      } else {
        toast({
          title: "Error",
          description: "Gagal membuat pembayaran QRIS.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghubungi server pembayaran.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const confirmPayment = async () => {
    try {
      const response = await fetch(
        `https://api.jkt48connect.my.id/api/orkut/cekstatus?merchant=OK1453563&keyorkut=584312217038625421453563OKCT6AF928C85E124621785168CD18A9B693&api_key=JKTCONNECT`
      );
      const data = await response.json();

      if (response.ok && data.status === "success") {
        // Ambil transaksi terbaru
        const latestTransaction = data.data.sort(
          (a: { date: string }, b: { date: string }) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        const latestTransactionAmount = parseInt(latestTransaction.amount, 10);
        const expectedAmount = paymentDetails?.totalAmount;

        if (latestTransactionAmount === expectedAmount) {
          // Tambah saldo ke akun pengguna
          const addBalanceResponse = await fetch(
            `https://dash.jkt48connect.my.id/api/auth/add-balance?phone_number=${paymentDetails.phoneNumber}&amount=${paymentDetails.depositAmount}`
          );
          const addBalanceData = await addBalanceResponse.json();

          if (addBalanceResponse.ok && addBalanceData.success) {
            toast({
              title: "Success",
              description: "Pembayaran berhasil. Deposit Anda sudah ditambahkan.",
              status: "success",
              duration: 3000,
              isClosable: true,
            });

            // Simpan riwayat deposit
            const newDepositRequest = {
              phoneNumber: paymentDetails.phoneNumber,
              depositAmount: paymentDetails.depositAmount,
              totalAmount: paymentDetails.totalAmount,
              status: "Success",
            };
            const updatedRequests = [...depositRequests, newDepositRequest];
            setDepositRequests(updatedRequests);
            localStorage.setItem("deposit-requests", JSON.stringify(updatedRequests));

            // Kirim notifikasi ke webhook
            await fetch(webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                embeds: [
                  {
                    title: "Deposit Berhasil",
                    fields: [
                      { name: "Nomor", value: paymentDetails.phoneNumber, inline: true },
                      { name: "Nominal", value: `Rp${paymentDetails.depositAmount}`, inline: true },
                      { name: "Total Pembayaran", value: `Rp${paymentDetails.totalAmount}`, inline: true },
                    ],
                    color: 3066993, // Green
                  },
                ],
              }),
            });

            setPaymentPopup(false);
          } else {
            toast({
              title: "Error",
              description: "Gagal menambahkan saldo.",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        } else {
          toast({
            title: "Error",
            description: "Pembayaran tidak sesuai dengan jumlah yang diharapkan.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memeriksa pembayaran.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex direction="column" gap={5}>
      <Heading>Top Up Deposit</Heading>
      <VStack spacing={4} align="stretch">
        <Input
          type="number"
          placeholder="Masukkan Nominal Top Up"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
        <Input
          placeholder="Masukkan Nomor"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleSubmit}>
          {isLoadingPayment ? <Spinner /> : "Ajukan Top Up Deposit"}
        </Button>
      </VStack>
    </Flex>
  );
}
