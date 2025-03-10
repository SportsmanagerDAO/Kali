import {
  Text,
  HStack,
  Stack,
  Button,
  Spacer,
  useColorModeValue,
} from "@chakra-ui/react";
import { BsTwitter, BsGithub } from "react-icons/bs";

export default function Footer() {
  return (
    <HStack
      spacing={4}
      id="footer"
    >
      <Text fontSize="xs">
        Summoned with{" "}
        <a href="https://twitter.com/lex_DAO" target="_blank" rel="noreferrer">
          <i>SportsClubDAO</i>
        </a>
      </Text>
      <Spacer />
      <Stack direction={"row"} spacing={4} id="social-icons">
        <Button
          className="social"
          rounded={"full"}
          as={"a"}
          href={"https://twitter.com/_SportsClubDAO"}
          target="_blank"
        >
          <BsTwitter />
        </Button>
        <Button
          className="social"
          rounded={"full"}
          as={"a"}
          href={"https://github.com/lexDAO/SportsClub"}
          target="_blank"
        >
          <BsGithub />
        </Button>
      </Stack>
    </HStack>
  );
}
