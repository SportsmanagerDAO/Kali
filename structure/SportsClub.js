import { Box, Link, IconButton, Text, Heading } from "@chakra-ui/react";
import { AiFillHome } from "react-icons/ai";
import { routeHome } from "../../utils/router";

export default function SportsClub() {
  const home = () => {
    routeHome();
    console.log("click");
  };
  return (
    <>
      <Heading
        id="sports-club-dao-logo"
        letterSpacing="wide"
        fontWeight="extrabold"
      >
        <Link onClick={home}>SportsClubDAO</Link>
      </Heading>
    </>
  );
}
