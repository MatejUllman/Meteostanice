import React from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const About = () => {
  return (
    <Container maxWidth="md">
      <Card sx={{ marginTop: 4, padding: 2, backgroundColor: "#f5f5f5" }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Meteostanice - Ročníkový projekt
          </Typography>
          <Typography variant="body1">
            Tento projekt představuje kompaktní meteostanici, která měří
            teplotu, vlhkost, tlak, rychlost větru a další meteorologické údaje.
            Cílem bylo vytvořit zařízení, které sbírá data v reálném čase a
            umožňuje jejich analýzu prostřednictvím webové aplikace.
          </Typography>

          <Typography variant="h5" gutterBottom>
            Použité technologie
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="ESP32 - Wi-Fi mikrokontroler" />
            </ListItem>
            <ListItem>
              <ListItemText primary="BME280 a BME680 - senzory pro měření teploty, vlhkosti a tlaku" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Anemometr - měření rychlosti větru" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Arduino IDE + C++ - programování" />
            </ListItem>
            <ListItem>
              <ListItemText primary="mysql - databáze pro ukládání dat" />
            </ListItem>
            <ListItem>
              <ListItemText primary="phpMyAdmin - webové rozhraní pro MySQL" />
            </ListItem>
            <ListItem>
              <ListItemText primary="React - frontend" />
            </ListItem>
            <ListItem>
              <ListItemText primary="FastAPI - backend" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default About;
