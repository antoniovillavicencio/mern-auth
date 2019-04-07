import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from "@material-ui/core/Typography";
import whiteWallImg from "./../assets/images/white-wall.jpg";

const styles = theme => ({
  card: {
    maxWidth: 200,
    margin: "auto",
    marginTop: theme.spacing.unit * 5,
  },
  title: {
    padding: `${theme.spacing.unit * 3}px ${theme.spacing.unit * 2.5}px ${theme
      .spacing.unit * 2}px`,
    color: theme.palette.text.secondary
  },
  media: {
    minHeight: 100
  },
});

class Home extends Component {
  render() {
    const {classes} = this.props;
    return (
        <Card className={classes.card}>
          <Typography type="headline" component="h2" className={classes.title}>
            Home Page
          </Typography>
          <CardMedia className={classes.media} image={whiteWallImg} title="White wall" />
          <CardContent>
            <Typography type="body1" component="p">
              Welcome to my first MERN App
            </Typography>
          </CardContent>
        </Card>
    )
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Home);

