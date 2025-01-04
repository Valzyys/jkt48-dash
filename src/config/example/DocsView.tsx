import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tag,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FaDownload, FaMusic } from 'react-icons/fa';

interface FeatureItem {
  name: string;
  link: string;
  parameters: { name: string; type: string }[];
  method: 'GET' | 'POST';
  status: 'active' | 'inactive';
}

interface Category {
  title: string;
  description: string;
  icon: React.ElementType;
  features: FeatureItem[];
}

function DocsView() {
  const categories: Category[] = [
    {
      title: 'Downloader',
      description: 'Explore API endpoints for downloading various content.',
      icon: FaDownload,
      features: [
        {
          name: 'YouTube Downloader',
          link: '/docs/youtube-downloader',
          parameters: [
            { name: 'url', type: 'string' },
            { name: 'apikey', type: 'string' },
          ],
          method: 'POST',
          status: 'active',
        },
        {
          name: 'Instagram Downloader',
          link: '/docs/instagram-downloader',
          parameters: [
            { name: 'url', type: 'string' },
            { name: 'apikey', type: 'string' },
          ],
          method: 'POST',
          status: 'inactive',
        },
      ],
    },
    {
      title: 'JKT48',
      description: 'Access APIs related to JKT48 content.',
      icon: FaMusic,
      features: [
        {
          name: 'Member List',
          link: '/docs/member-list',
          parameters: [{ name: 'apikey', type: 'string' }],
          method: 'GET',
          status: 'active',
        },
        {
          name: 'Showroom Schedule',
          link: '/docs/showroom-schedule',
          parameters: [{ name: 'apikey', type: 'string' }],
          method: 'GET',
          status: 'active',
        },
      ],
    },
  ];

  return (
    <Flex direction="column" gap={6} p={6}>
      <Heading size="lg" fontWeight="bold">
        API Documentation
      </Heading>
      <Text color="gray.600" mb={4}>
        Browse through our API categories to learn how to use various endpoints.
      </Text>
      {categories.map((category, index) => (
        <CategorySection key={index} {...category} />
      ))}
    </Flex>
  );
}

function CategorySection({ title, description, icon, features }: Category) {
  return (
    <Box
      as="section"
      mb={6}
      borderWidth="1px"
      borderRadius="md"
      p={4}
      bg="white"
      _dark={{ bg: 'gray.800' }}
      shadow="sm"
    >
      <HStack mb={4} spacing={4} align="center">
        <Icon as={icon} w={6} h={6} color="blue.500" />
        <Heading size="md">{title}</Heading>
      </HStack>
      <Text fontSize="sm" color="gray.500" mb={6}>
        {description}
      </Text>
      <FeatureTable features={features} />
    </Box>
  );
}

function FeatureTable({ features }: { features: FeatureItem[] }) {
  return (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Parameters</Th>
          <Th>Method</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {features.map((feature, index) => (
          <Tr key={index}>
            <Td>
              <Link href={feature.link}>
                <Text color="blue.500" fontWeight="bold" fontSize="sm">
                  {feature.name}
                </Text>
              </Link>
            </Td>
            <Td>
              <Text fontSize="sm">
                {feature.parameters
                  .map((param) => `${param.name} (${param.type})`)
                  .join(', ')}
              </Text>
            </Td>
            <Td>
              <Tag colorScheme={feature.method === 'GET' ? 'blue' : 'green'}>
                {feature.method}
              </Tag>
            </Td>
            <Td>
              <Tag
                colorScheme={feature.status === 'active' ? 'teal' : 'red'}
                textTransform="capitalize"
              >
                {feature.status}
              </Tag>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default DocsView;
