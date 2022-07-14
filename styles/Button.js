const Button = {
  baseStyle: {
    display: "flex",
    justifyContent: "center",
    alignItem: "center",
    border: "1px",
  },
  variants: {
    outline: (props) => ({
      bg: props.colorMode === "dark" ? "sportsClubDao.700" : "sportsClubDao.900",
      color: props.colorMode === "dark" ? "sportsClubDao.900" : "sportsClubDao.800",
    }),
    ghost: (props) => ({
      bg: props.colorMode === "dark" ? null : null,
      color: props.colorMode === "dark" ? "sportsClubDao.900" : "sportsClubDao.800",
    }),
    solid: (props) => ({
      bg: props.colorMode === "dark" ? "sportsClubDao.700" : "sportsClubDao.900",
      color: props.colorMode === "dark" ? "sportsClubDao.900" : "sportsClubDao.800",
    }),
  },
  defaultProps: {
    colorScheme: "sportsClubDao",
  },
};

export default Button;
