-- MySQL dump 10.13  Distrib 8.0.35, for Linux (x86_64)
--
-- Host: gng-db.cb7ryzdh8yml.ap-southeast-1.rds.amazonaws.com    Database: gng_live_v4
-- ------------------------------------------------------
-- Server version	5.5.5-10.6.14-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `warehouse`
--

DROP TABLE IF EXISTS `warehouse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouse` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('shop','warehouse','online_shop') NOT NULL DEFAULT 'warehouse',
  `address` varchar(255) NOT NULL,
  `lat` varchar(50) NOT NULL,
  `long` varchar(50) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `close_days` varchar(255) DEFAULT NULL,
  `open_time` varchar(255) NOT NULL,
  `video_link` varchar(50) DEFAULT NULL,
  `image_360` varchar(50) DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse`
--

LOCK TABLES `warehouse` WRITE;
/*!40000 ALTER TABLE `warehouse` DISABLE KEYS */;
INSERT INTO `warehouse` VALUES (1,'Gadget & Gear - Bashundhara City','shop','Shop 04, Block B, Level 1, Bashundhara City. ','-10.45333','10.45333','01711-366366','','Saturday,Tuesday','9:00 AM - 8:00 PM','','','GGS000','2023-11-15 08:42:09.197128','2023-12-27 20:06:38.738266',NULL),(2,'Gadget & Gear - Apple Authorized Reseller in Bangladesh','shop','Ground Floor, Rupayan Golden Age','23.22','24.33','01611-010101','azheruddin617mr305@gmail.com','Wednesday','9:00 AM - 8:00 PM','','','GGS001','2023-11-15 10:28:41.349926','2023-12-27 20:06:38.813642',NULL),(3,'Gadget & Gear - Uttara North Tower','shop','Shop 506, 5th Floor, North Tower. ','-10.45333','10.45333','01744-838383','','Saturday','9:00AM - 8:00PM','link','','GGS002','2023-11-19 11:43:56.667070','2023-12-27 20:06:38.890161',NULL),(4,'Gadget & Gear  -  Banani 11','shop','ANZ Huq Eleven Square, Plot 01, Block H, Ground Floor','-10.45333','10.45333',' 01717-151515','','Saturday','9:00AM - 8:00PM','','','GGS003','2023-11-19 11:44:05.078470','2023-12-27 20:06:38.964716',NULL),(5,'Gadget & Gear ( G&G5,  Bashundhara City)','shop','Shop 61&62, Block B, Level 6, Bashundhara City Shopping Complex, Panthapath','0','0','01711-666888','','','9:00AM - 8:00PM','','','GGS004','2023-12-24 12:17:46.506233','2023-12-27 20:06:39.040736',NULL),(6,'Gadget & Gear - Jamuna Future Park ','shop','Shop 4A, Block C, Level 4, Jamuna Future Park','0','0','09678-666786, 01733-564455','','','9:00AM-8:00PM','','','GGS005','2023-12-24 12:22:43.411686','2023-12-27 20:06:39.116307',NULL),(7,'Gadget & Gear  - Dhanmondi ','shop','GH Heights, 67 Satmosjid Road','0','0','09678-666773, 01786-500600','','','9:AM-8:00PM','','','GGS006','2023-12-24 12:23:46.153424','2023-12-27 20:06:39.192768',NULL),(8,'Gadget & Gear -  Police Plaza Concord','shop','Shop 521, 4th Floor.','0','0','0967-8666774,01786-111888','','','9:AM-8:00PM','','','GGS007','2023-12-24 12:26:51.551539','2023-12-27 20:06:39.267310',NULL),(9,'Gadget & Gear -  Motijheel','shop','127 Motijheel C/A','0','0','09678-666784,01786-111999','','','9:00AM-8:00PM','','','GGS008','2023-12-24 12:27:46.909197','2023-12-27 20:06:39.344793',NULL),(10,'Gadget & Gear -  Bashundhara City','shop','Shop 2, Block B, Level 1, Bashundhara City Shopping Complex, Panthapath, Dhaka 1205','0','0','0','','','9:00AM-8:00PM','','','GGS009','2023-12-24 12:28:46.739852','2023-12-27 20:06:39.419626',NULL),(11,'Gadget & Gear  - Khilgaon','shop','House 397/B, Khilgaon Chowdhury Para\n','0','0','09678-666781, 01799-828251','','','9:00AM-8:00PM','','','GGS010','2023-12-24 12:29:41.122998','2023-12-27 20:06:39.495440',NULL),(12,'Gadget & Gear - Purana Paltan','shop','Shop 1-3, Al-Razi Complex, 166/167, Syed Nazrul Islam Saroni, Purana Paltan','0','0','09678-666783,01720-512345','','','9:00AM-8:00PM ','','','GGS011','2023-12-24 12:30:48.514908','2023-12-27 20:06:39.570057',NULL),(13,'Gadget & Gear - Bashundhara City','shop','Shop 1&2, Block B, Level 6, Bashundhara City Shopping Complex, Panthapath','0','0','09678-666778,01910-116611','','','9:00AM-8:00PM','','','GGS012','2023-12-24 12:32:58.593370','2023-12-27 20:06:39.646209',NULL),(14,'Gadget & Gear - Jamuna Future Park','shop','Shop 18A, Block C, Level 4, Jamuna Future Park','0','0','09678-666787,01786-111444','','','9:00AM-8:00PM','','','GGS013','2023-12-24 12:45:10.191950','2023-12-27 20:06:39.721009',NULL),(15,'Gadget & Gear  -  Tokyo Square','shop','Shop 642, Level 6, Japan Garden City\n','0','0','09678-666771,01730-050300','','','9:00AM-8:00PM','','','GGS014','2023-12-24 12:46:09.456975','2023-12-27 20:06:39.796643',NULL),(16,'Gadget & Gear  -  Mirpur 11','shop','House 11, Section 11, Block A, Main Road, Mirpur 11\n','0','0','09678-666794,01322-883303','','','9:00AM-8:00PM','','','GGS015','2023-12-24 12:47:25.277818','2023-12-27 20:06:39.872046',NULL),(17,'Gadget & Gear - Bailey Road ','shop','Green Cozy Cottage, 2 Bailey Road	\n','0','0','09678-666772, 01610-300300','','','9:00AM-8:00PM','','','GGS016','2023-12-24 12:48:26.648759','2023-12-27 20:06:39.946596',NULL),(18,'Gadget & Gear -  Uttara Rak Tower','shop','Shop 218, 1st Floor, Plot 1/A, RAK Tower\n','0','0','0967-8666780,01799-828248','','','9:00AM-8:00PM','','','GGS017','2023-12-24 13:02:58.579540','2023-12-27 20:06:40.021562',NULL),(19,'Gadget & Gear  - Jamuna Future Park','shop','Shop 42B, Block C, Level 4, Jamuna Future Park\n','0','0','09678-666788,01786-111333','','','9:00AM-8:00PM','','','GGS018','2023-12-24 13:05:20.753506','2023-12-27 20:06:40.112647',NULL),(20,'Gadget & Gear  -  Dhanmondi Gawsia Twin Peak','shop','Gawsia Twin Peak, Level 1, Type A, House 42 & 43, Satmosjid Road, Dhanmondi\n','0','0','09678-666789,01318-236990','','','9:00AM-8:00PM','','','GGS019','2023-12-24 13:05:58.218697','2023-12-27 20:06:40.197226',NULL),(21,'Gadget & Gear  -  Bashundhara R/A','shop','Plot No C2, Ground Floor , Rupayan Shopping Square\n','0','0','09678-666792,01318-236987','','','9:00AM-8:00PM','','','GGS020','2023-12-24 13:06:40.319573','2023-12-27 20:06:40.271807',NULL),(22,'Gadget & Gear  - Uttara 11','shop','36, Khawja Gareeb-e-Newaz Avenue, Sector-11, Uttara	\n','0','0','09678-666793, 01322-883302','','','9:00AM-8:00PM','','','GGS021','2023-12-24 13:07:37.555463','2023-12-27 20:06:40.347336',NULL),(23,'Gadget & Gear  - Wari','shop',' A.K Famous Tower, 41 Rankin Street, Wari	\n','0','0','09678-666795,01942-778484','','','9:00AM-8:00PM','','','GGS022','2023-12-24 13:09:01.874314','2023-12-27 20:06:40.421978',NULL),(24,'Gadget & Gear  - Gulshan Avenue','shop','Shop- 13, Ground Floor, Rupayan Golden Age\n','0','0','0','','','9:00AM-8:00PM','','','GGS023','2023-12-24 13:09:46.542816','2023-12-27 20:06:40.496904',NULL),(25,'Gadget Studio ','warehouse','n/a','0','0','0','','','-','','','GGS024','2023-12-24 13:19:12.703887','2023-12-27 20:06:40.572549',NULL),(26,'G&G Online','online_shop','n/a','0','0','0','','','n/a','','','GGS025','2023-12-24 13:20:00.291674','2023-12-27 20:06:40.649017',NULL),(27,'NetPlus Motijheel ','warehouse','n/a','0','0','0','','','n/a','','','GGS026','2023-12-24 13:20:22.965077','2023-12-27 20:06:40.723484',NULL),(28,'HO','warehouse','n/a','0','0','0','','','n/a','','','GGS027','2023-12-24 13:20:49.402225','2023-12-27 20:06:40.799069',NULL),(29,'EXCS','warehouse','n/a','0','0','0','','','n/a','','','GGS028','2023-12-24 13:21:09.943747','2023-12-27 20:06:40.874618',NULL),(30,'Spigen','warehouse','n/a','0','0','0','','','n/a','','','GGS030','2023-12-24 13:21:35.290321','2023-12-27 20:06:40.951144',NULL),(31,'Faulty_Gear','warehouse','n/a','0','0','0','','','n/a','','','GGS031','2023-12-24 13:23:56.630536','2023-12-27 20:06:41.026201',NULL),(32,'G&G DH','warehouse','n/a','0','0','0','','','n/a','','','GGS032','2023-12-24 13:24:17.023922','2023-12-27 20:06:41.101681',NULL);
/*!40000 ALTER TABLE `warehouse` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-01-02 13:11:47
