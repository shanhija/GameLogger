-- MySQL dump 10.13  Distrib 5.1.73, for unknown-linux-gnu (x86_64)
--
-- ------------------------------------------------------
-- Server version	5.1.73-cll

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `gl_ancient`
--

DROP TABLE IF EXISTS `gl_ancient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gl_ancient` (
  `player` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  `gameid` int(11) DEFAULT NULL,
  `began` int(11) DEFAULT NULL,
  `updated` int(11) DEFAULT NULL,
  `apmavg` int(11) DEFAULT NULL,
  `lanid` varchar(50) COLLATE utf8_bin DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gl_apm`
--

DROP TABLE IF EXISTS `gl_apm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gl_apm` (
  `player` varchar(20) COLLATE utf8_bin NOT NULL DEFAULT '',
  `updated` int(11) DEFAULT NULL,
  `apm` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`player`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gl_apm_history`
--

DROP TABLE IF EXISTS `gl_apm_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gl_apm_history` (
  `player` varchar(20) COLLATE utf8_bin NOT NULL DEFAULT '',
  `updated` int(11) DEFAULT NULL,
  `apm` varchar(20) COLLATE utf8_bin DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gl_apm_minute`
--

DROP TABLE IF EXISTS `gl_apm_minute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gl_apm_minute` (
  `player` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  `began` int(11) DEFAULT NULL,
  `ends` int(11) DEFAULT NULL,
  `apm` varchar(255) COLLATE utf8_bin DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gl_history`
--

DROP TABLE IF EXISTS `gl_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gl_history` (
  `player` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  `gameid` int(11) DEFAULT NULL,
  `began` int(11) DEFAULT NULL,
  `updated` int(11) DEFAULT NULL,
  `apmsum` int(11) DEFAULT NULL,
  `updates` int(11) DEFAULT NULL,
  UNIQUE KEY `player` (`player`,`began`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gl_playing`
--

DROP TABLE IF EXISTS `gl_playing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gl_playing` (
  `player` varchar(20) NOT NULL,
  `gameid` int(11) DEFAULT NULL,
  `began` int(11) DEFAULT NULL,
  `updated` int(11) DEFAULT NULL,
  `apmsum` int(11) DEFAULT NULL,
  `updates` int(11) DEFAULT NULL,
  PRIMARY KEY (`player`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gl_playing`
--

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-04-05 13:10:42
