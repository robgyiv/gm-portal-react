import { GridItem, Heading, Text } from '@chakra-ui/react';

export default function Header() {
  return (
    <header>
      <GridItem rowstart={1} rowEnd={1}>
        <Heading>gm portal</Heading>
        <Text>It is time to say gm</Text>
      </GridItem>
    </header>
  );
}
