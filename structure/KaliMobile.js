import { Box, Link, IconButton, Text } from "@chakra-ui/react";
import { AiFillHome } from "react-icons/ai";
import { routeHome } from "../../utils/router";

export default function SportsClub() {
  const home = () => {
    routeHome();
    console.log("click");
  };
  return (
    <>
      <Box
        as="h1"
        letterSpacing="wide"
        fontWeight="extrabold"
        fontSize="md"
        bgGradient="linear(to-br, sportsClubDao.900, sportsClubDao.600)"
        bgClip="text"
        textShadow="2.4px 0.4px sportsClubDao.900"
        ml={2}
      >
        <Link onClick={home}>SportsClubDAO</Link>
      </Box>
    </>
  );
}
