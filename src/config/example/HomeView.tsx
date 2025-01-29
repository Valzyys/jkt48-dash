import {
  Center,
  Circle,
  Flex,
  Grid,
  Heading,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useToast,
  Box,
  Input,
  IconButton,
  useDisclosure,
Modal,
ModalOverlay,
ModalContent,
ModalHeader,
ModalCloseButton,
ModalBody,
ModalFooter,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { config } from '@/config/common';
import { StyledChart } from '@/components/chart/StyledChart';
import { dashboard } from '@/config/translations/dashboard';
import Link from 'next/link';
import { BsMusicNoteBeamed } from 'react-icons/bs';
import { IoOpen, IoPricetag } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import { MdVoiceChat, MdVisibility, MdVisibilityOff, MdAccountBalanceWallet } from 'react-icons/md';
import { GuildSelect } from '@/pages/user/home';
import { IoPlay, IoPause, IoPlaySkipForward, IoPlaySkipBack } from 'react-icons/io5';
import { useSelfUser } from '@/api/hooks'; 

export default function HomeView() {
  const t = dashboard.useTranslations();

  useEffect(() => {
    // Fungsi untuk memutar audio
    const playAudio = async () => {
      try {
        const audio = new Audio('/ElevenLabs_2025-01-23T10_56_22_Kira_pvc_s50_sb100_se0_b_m2.mp3');
        audio.volume = 0.6; // Atur volume jika diperlukan
        await audio.play(); // Memulai pemutaran audio
      } catch (error) {
        console.error('Gagal memutar audio:', error);
      }
    };

    playAudio(); // Panggil fungsi untuk memutar audio
  }, []); // Hanya dipanggil sekali saat komponen di-mount

  function initializeApiKeyInClient() {
  if (typeof window !== 'undefined') {
    const existingKey = localStorage.getItem('jkt48-api-key');

    if (!existingKey) {
      fetch('/api/auth/get-api-key')
        .then((res) => res.json())
        .then((data) => {
          if (data.apiKey) {
            localStorage.setItem('jkt48-api-key', data.apiKey);
            console.log('API Key saved to localStorage:', data.apiKey);
          }
        })
        .catch((err) => console.error('Failed to fetch API key:', err));
    } else {
      console.log('API Key already exists in localStorage:', existingKey);
    }
  }
};

useEffect(() => {
    initializeApiKeyInClient();
  }, []);


  return (
    <Flex direction="column" gap={5}>
      {/* Invite Section */}
      <Flex direction="row" alignItems="center" rounded="2xl" bg="Brand" gap={4} p={5}>
        <Circle
          color="white"
          bgGradient="linear(to right bottom, transparent, blackAlpha.600)"
          p={4}
          shadow="2xl"
          display={{ base: 'none', md: 'block' }}
        >
          <Icon as={FaRobot} w="60px" h="60px" />
        </Circle>

        <Flex direction="column" align="start" gap={1}>
          <Heading color="white" fontSize="2xl" fontWeight="bold">
            {t.invite.title}
          </Heading>
          <Text color="whiteAlpha.800">{t.invite.description}</Text>
          <Button
            mt={3}
            as={Link}
            href={config.inviteUrl}
            color="white"
            bg="whiteAlpha.200"
            _hover={{
              bg: 'whiteAlpha.300',
            }}
            _active={{
              bg: 'whiteAlpha.400',
            }}
            leftIcon={<IoOpen />}
          >
            {t.invite.bn}
          </Button>
        </Flex>
      </Flex>

      {/* JKT48Connect Section */}
     <Grid
  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
  gap={4}
>
       <Flex direction="column" gap={3}>
          <VoiceChannelItem />
        </Flex>
      </Grid>

      {/* Servers Section */}
      <Flex direction="column" gap={1} mt={3}>
        <Heading size="md">{t.servers.title}</Heading>
        <Text color="TextSecondary">{t.servers.description}</Text>
      </Flex>
      <GuildSelect />

      {/* Commands Section */}
      <Flex direction="column" gap={1}>
        <Heading size="md">{t.command.title}</Heading>
        <Text color="TextSecondary">{t.command.description}</Text>
        <HStack mt={3}>
          <Button leftIcon={<IoPricetag />} variant="action">
            {t.pricing}
          </Button>
          <Button px={6} rounded="xl" variant="secondary">
            {t.learn_more}
          </Button>
        </HStack>
      </Flex>

      {/* Chart Section */}
      <TestChart />

      {/* Radio Music Section */}
<Flex direction="column" gap={3} mt={5}>
  <Heading size="md">Radio Music Section</Heading>
  <Card rounded="3xl" variant="primary">
    <CardBody as={Center} p={4} flexDirection="column" gap={3}>
      <MusicPlayer />
    </CardBody>
  </Card>
</Flex>
    </Flex>
  );
}


function TestChart() {
    const getFormattedDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  };


  const [seriesData, setSeriesData] = useState([
    {
      name: "Requests",
      data: [0, 0, 0, 0, 0, 0], // Data awal
    },
  ]);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);
  const [lastCheckedRequests, setLastCheckedRequests] = useState<number | null>(null);
  const [today, setToday] = useState<string>(getFormattedDate());

  useEffect(() => {
    // Fetch initial data
    fetchRemainingRequests();

    // Set interval to fetch data every hour (or as required)
    const intervalId = setInterval(() => {
      fetchRemainingRequests();
    }, 3600000); // 1 hour in milliseconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Check for day change
    const intervalId = setInterval(() => {
      const currentDay = getFormattedDate();
      if (currentDay !== today) {
        resetDailyData();
        setToday(currentDay);
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [today]);

  const fetchRemainingRequests = async () => {
    try {
      const response = await fetch(`https://api.jkt48connect.my.id/api/check-apikey/YOUR_API_KEY`);
      const data = await response.json();

      if (data.success && data.remaining_requests !== null) {
        const newRemainingRequests = data.remaining_requests;

        if (lastCheckedRequests !== null) {
          const usage = lastCheckedRequests - newRemainingRequests;
          if (usage > 0) {
            updateChartData(usage);
          }
        }

        setLastCheckedRequests(newRemainingRequests);
        setRemainingRequests(newRemainingRequests);
      }
    } catch (error) {
      console.error("Failed to fetch remaining requests:", error);
    }
  };

  const updateChartData = (usage: number) => {
    setSeriesData((prevData) => {
      const updatedData = [...prevData[0].data];
      updatedData.push(usage);

      // Keep only the last 6 days of data
      if (updatedData.length > 6) {
        updatedData.shift();
      }

      return [{ name: "Requests", data: updatedData }];
    });
  };

  const resetDailyData = () => {
    setSeriesData((prevData) => {
      const updatedData = [...prevData[0].data];
      updatedData.push(0); // Reset daily usage to 0

      // Keep only the last 6 days of data
      if (updatedData.length > 6) {
        updatedData.shift();
      }

      return [{ name: "Requests", data: updatedData }];
    });

    setLastCheckedRequests(remainingRequests); // Reset last checked requests
  };

  return (
    <StyledChart
      options={{
        colors: ["#4318FF"], // Line color
        chart: {
          type: "line",
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 1000,
          },
        },
        stroke: {
          curve: "smooth",
          width: 2,
        },
        xaxis: {
          categories: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Today"], // Example labels
        },
        yaxis: {
          labels: {
            formatter: (value) => `${value} requests`,
          },
        },
        grid: {
          borderColor: "#EDEDED",
          strokeDashArray: 4,
        },
        legend: {
          show: false,
        },
      }}
      series={seriesData}
      height="300"
      type="line"
    />
  );
}


function MusicPlayer() {
  const videoUrls = [
    { url: 'https://8030.us.kg/file/tu1QxK8pfvGN.mp4', title: 'Dj Anugrah Terindah' },
    { url: 'https://8030.us.kg/file/SSN3QnR0C5sU.mp4', title: 'Dj Terlalu Cinta' },
    { url: 'https://8030.us.kg/file/wU0N09SMt41S.mp4', title: 'Gedene Cintaku Luarr Biasa (Tresno Tekan Mati)' },
    { url: 'https://8030.us.kg/file/BBjoKygdO5Wi.mp4', title: 'Dj Aku Gak Mau Selain Kamu' }   
  ]; // Daftar file video .mp4 dengan judul
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // Indeks lagu saat ini
  const [isPlaying, setIsPlaying] = useState(false); // Status pemutaran
  const videoRef = useRef<HTMLVideoElement>(null); // Referensi ke elemen video

  const currentTrack = videoUrls[currentTrackIndex];

  const playVideo = () => {
    setIsPlaying(true);
    if (videoRef.current) videoRef.current.play();
  };

  const pauseVideo = () => {
    setIsPlaying(false);
    if (videoRef.current) videoRef.current.pause();
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % videoUrls.length);
    setIsPlaying(true);
  };

  const previousTrack = () => {
    setCurrentTrackIndex((prevIndex) =>
      prevIndex - 1 < 0 ? videoUrls.length - 1 : prevIndex - 1
    );
    setIsPlaying(true);
  };

  return (
    <Flex direction="column" align="center" gap={3}>
      <Text fontWeight="medium">Now Playing:</Text>
      <Text fontSize="lg" fontWeight="bold" textAlign="center">
        {currentTrack.title}
      </Text>
      <Box w="100%" maxW="600px" rounded="lg" overflow="hidden" shadow="md">
        <video
          ref={videoRef}
          width="100%"
          height="300"
          src={currentTrack.url}
          controls={false} // Tidak menampilkan kontrol bawaan
          onEnded={nextTrack} // Lanjut ke lagu berikutnya setelah video selesai
        ></video>
      </Box>
            {/* Audio untuk pemutaran latar belakang */}
      <audio ref={videoRef} src={currentTrack.url} preload="auto" onEnded={nextTrack}></audio>

      <HStack spacing={4} mt={4}>
        <IconButton
          icon={<IoPlaySkipBack />}
          aria-label="Previous Track"
          onClick={previousTrack}
          isDisabled={videoUrls.length <= 1}
        />
        {isPlaying ? (
          <IconButton
            icon={<IoPause />}
            aria-label="Pause Video"
            onClick={pauseVideo}
          />
        ) : (
          <IconButton
            icon={<IoPlay />}
            aria-label="Play Video"
            onClick={playVideo}
          />
        )}
        <IconButton
          icon={<IoPlaySkipForward />}
          aria-label="Next Track"
          onClick={nextTrack}
          isDisabled={videoUrls.length <= 1}
        />
      </HStack>
    </Flex>
  );
}

export function VoiceChannelItem() {
  const user = useSelfUser(); // Mendapatkan data user dari API
  const [apiKey, setApiKey] = useState < string > ('');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState < boolean > (false);
  const [balance, setBalance] = useState < number | null > (null);
  const [inputApiKey, setInputApiKey] = useState < string > ('');
  const [apiData, setApiData] = useState < any > (null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('jkt48-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      fetchBalance(user?.id);
    }
  }, [user?.id]);

  const fetchBalance = async (userId: string) => {
    try {
      const response = await fetch(`/api/auth/get-user-data?id=${userId}`);
      const data = await response.json();
      if (data.user?.balance !== undefined) {
        setBalance(Number(data.user.balance));
      }
    } catch (error) {
      console.error('Gagal mengambil saldo:', error);
    }
  };

  const checkApiKey = async () => {
    if (!inputApiKey) {
      toast({
        title: 'Error',
        description: 'Harap masukkan API Key!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`https://api.jkt48connect.my.id/api/check-apikey/${inputApiKey}`);
      const data = await response.json();

      if (data.success) {
        const premiumStatus = data.premium ? 'Ya' : 'Tidak';
        const formattedCreatedAt = new Date(data.created_at)
          .toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false })
          .replace(',', ' WIB');

        setApiData({
          username: user?.username,
          id: user?.id,
          apiKey: data.api_key,
          limit: data.remaining_requests,
          balance: data.balance,
          sinceAt: formattedCreatedAt,
          premium: premiumStatus,
        });

        onOpen();
      } else {
        toast({
          title: 'API Key Tidak Valid',
          description: data.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Gagal memeriksa API Key:', error);
      toast({
        title: 'Terjadi Kesalahan',
        description: 'Tidak dapat menghubungi server API.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  return (
    <Flex direction="column" gap={4}>
      {/* Status API Key */}
      <Card rounded="2xl" variant="primary" p={{ base: 4, md: 6 }}>
        <CardHeader as={HStack}>
          <Icon as={MdVoiceChat} color="Brand" fontSize={{ base: 'xl', md: '2xl' }} />
          <Text fontSize={{ base: 'md', md: 'lg' }}>Status API Key</Text>
        </CardHeader>
        <CardBody>
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            color={apiStatus?.includes('valid') ? 'green.500' : 'red.500'}
            fontWeight="medium"
          >
            {apiStatus || 'Memeriksa API Key...'}
          </Text>
        </CardBody>
      </Card>

      {/* API Key */}
      <Card rounded="2xl" variant="primary" p={{ base: 4, md: 6 }}>
        <CardHeader>
          <HStack justify="space-between" align="center">
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
              {isApiKeyVisible ? apiKey : '•'.repeat(apiKey.length)}
            </Text>
            <Button
              size="sm"
              onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
              variant="ghost"
              p={0}
            >
              {isApiKeyVisible ? <MdVisibilityOff /> : <MdVisibility />}
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          {apiKey ? (
            <Text fontSize={{ base: 'sm', md: 'md' }} color="TextSecondary">
              API Key
            </Text>
          ) : (
            <Text color="TextSecondary">API Key belum tersedia. Silakan tambahkan API Key di profil.</Text>
          )}
        </CardBody>
      </Card>

      {/* Saldo User */}
      <Card rounded="2xl" variant="primary" p={{ base: 4, md: 6 }}>
        <CardHeader as={HStack}>
          <Icon as={MdAccountBalanceWallet} color="Brand" fontSize={{ base: 'xl', md: '2xl' }} />
          <Text fontSize={{ base: 'md', md: 'lg' }}>Saldo</Text>
        </CardHeader>
        <CardBody>
          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">
            {balance !== null ? `Rp ${balance.toLocaleString()}` : 'Memuat...'}
          </Text>
          <Text fontSize="sm" color="TextSecondary">
            Saldo akun Anda yang tersisa
          </Text>
        </CardBody>
      </Card>
            {/* Card Cek API Key */}
      <Card rounded="2xl" variant="primary" p={4}>
        <CardHeader as={HStack}>
          <Text fontSize="lg">Cek API Key</Text>
        </CardHeader>
        <CardBody>
          <Input
            placeholder="Masukkan API Key Anda"
            value={inputApiKey}
            onChange={(e) => setInputApiKey(e.target.value)}
            mb={3}
          />
          <Button colorScheme="blue" onClick={checkApiKey}>
            Periksa API Key
          </Button>
        </CardBody>
      </Card>

      {/* Dialog Popup */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detail API Key</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {apiData && (
              <Flex direction="column" gap={2}>
                <Text><strong>Username:</strong> {apiData.username}</Text>
                <Text><strong>ID:</strong> {apiData.id}</Text>
                <Text><strong>API Key:</strong> {apiData.apiKey}</Text>
                <Text><strong>Limit:</strong> {apiData.limit}</Text>
                <Text><strong>Saldo:</strong> Rp {apiData.balance.toLocaleString()}</Text>
                <Text><strong>Sejak:</strong> {apiData.sinceAt}</Text>
                <Text><strong>Premium:</strong> {apiData.premium}</Text>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
