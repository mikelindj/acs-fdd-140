-- Import cloud data into local DB.
-- 1. Apply migrations (adds isSoldOut if missing): npx prisma migrate deploy
-- 2. Run this file: psql -h localhost -p 5432 -U michael -d acs_fdd140 -f scripts/import_cloud_data.sql
--
-- Truncate all app tables (avoids duplicate key errors)
TRUNCATE TABLE "admins", "event_settings", "inventory_settings", "vouchers", "guests", "bookings", "invite_codes", "tables", "_BookingGuests", "email_logs" CASCADE;

--
-- PostgreSQL database dump (DATA ONLY)
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET client_min_messages = warning;

COPY public.admins (id, email, name, "passwordHash", "createdAt", "updatedAt") FROM stdin;
admin-acsoba-user	admin@acsoba.org	ACS OBA Administrator	$2a$10$7afBvaq/2he20HmLUJCU0uns7r0c03xmbPxgX4CqVjMLYUyLDSgJC	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
\.


COPY public.event_settings (id, "eventName", "eventDate", "eventVenue", "logoImageUrl", "footerLogoImageUrl", "siteIconUrl", "updatedAt") FROM stdin;
event	140th ACS Founders' Day Dinner	2026-03-01 00:00:00	Shangri-La Singapore, Island Ballroom	/images/acs-140-logo.jpg	/images/acs-logo.png	/images/acs-140-siteicon.png	2026-01-10 06:44:04.272
\.


COPY public.inventory_settings (id, "totalTables", "maxElevenSeaterTables", "tablePrice", "seatPrice", "tablePromoPrice", "seatPromoPrice", "tableMembersPrice", "seatMembersPrice", "updatedAt", "isSoldOut") FROM stdin;
inventory	90	0	2800.00	280.00	2300.00	230.00	2100.00	230.00	2026-01-31 13:03:13.939	t
\.


COPY public.vouchers (id, code, name, notes, type, "discountPercent", "discountAmount", "fixedPrice", "maxRedemptions", "currentRedemptions", "isActive", "expiresAt", "createdAt", "updatedAt") FROM stdin;
cmkc7njm500007hgnrx1q3u4b	X9EDPF3H	ACS International	\N	PERCENTAGE	100.00	\N	\N	1	1	t	\N	2026-01-13 06:28:26.766	2026-01-13 06:30:06.462
cmkm3g9410000n94gugl77bwx	4DX8TCD2	ACJC staff	\N	PERCENTAGE	100.00	\N	\N	1	1	t	\N	2026-01-20 04:28:29.857	2026-01-20 04:30:43.848
cmkwn6ln40000fdy02ijj31hm	W6TUTEVN	SCHOOLS	\N	PERCENTAGE	100.00	\N	\N	10	5	f	\N	2026-01-27 13:38:33.616	2026-01-29 12:30:45.606
cmkkm7xkw0001up8hvro7v1xd	6RF8B6QN	ACSP PSG	\N	FIXED_PRICE	\N	\N	2100.00	3	0	f	\N	2026-01-19 03:38:22.016	2026-01-29 12:30:48.393
\.

COPY public.guests (id, name, email, mobile, "birthYear", school, "gradYear", dietary, "isVip", "membershipNo", "tableId", "createdAt", "updatedAt") FROM stdin;
cmk9s68c90000i5e5tzs6dgvj	Ivan Lee	mynameisivanlee@gmail.com	93837960	\N	ACS(I)	2005	\N	f		\N	2026-01-11 13:39:32.41	2026-01-11 13:39:32.41
cmk9s8i4l0006i5e5lcwjlh8u	Darren	dlxe_ling@hotmail.com	98266827	\N	ACS Independent	2005	\N	f	12401	\N	2026-01-11 13:41:18.405	2026-01-11 13:41:18.405
cmkae206s000011waxjej24wx	Zheng Ji	pzhengji@gmail.com	90753670	\N	ACS (Independent)	2014	\N	f	10526	\N	2026-01-11 23:52:06.773	2026-01-11 23:52:06.773
cmk7xchap000oui2bsagbvsy4	Kwek Wei Ming James	kwekwm@hotmail.com	97573149	\N	ACS (Independent)	1999	\N	f	8773	\N	2026-01-10 06:28:49.681	2026-01-10 06:28:49.681
cmk932e7f000014nk6gqzn997	WONG CHIANG YIN	chiangyin@gmail.com	97424680	\N	ACJC	1981	\N	f		\N	2026-01-11 01:56:42.987	2026-01-12 01:59:58.897
cmk7y0fac001cui2b0lop06la	Teoh Tiong Ann	teohsurg@gmail.com	93632323	\N	ACJC	1979	\N	f	2799	\N	2026-01-10 06:47:26.821	2026-01-10 06:47:26.821
cmk7x73rr0000ui2b09yf17hx	Amanda Yap	ark.yap@gmail.com	97397398	\N	ACJC	1990	\N	f	6787	\N	2026-01-10 06:24:38.871	2026-01-10 06:49:15.133
cmk7ychqy001sui2bo76vpyui	Tay Seng Kong Louis 	taylplm7@gmail.com	98386227	\N	ACS PreU	1967	\N	f	189	\N	2026-01-10 06:56:49.882	2026-01-10 06:56:49.882
cmk7xumvd000wui2bctl2ufey	Eric Chen	mail@ericchen.org	94741200	\N	ACSS	1982	\N	f	9685	\N	2026-01-10 06:42:56.713	2026-01-10 07:02:48.01
cmk7yks3v0028ui2bo40jecjb	Nicholas Chew	nickchew87@gmail.com	90052892	\N	Acs (Barker Road)	2004	\N	f	10021	\N	2026-01-10 07:03:16.555	2026-01-10 07:03:16.555
cmkajl9ws0008lxy39zqi403f	Benjamin Yap	benyap83@gmail.com	91770990	\N	Acs Barker 	1999	\N	f	997	\N	2026-01-12 02:27:03.916	2026-01-12 02:27:03.916
cmkti0mfx0000w69muyyv932i	Timothy Yong	tyong@redbadgepacific.com	91833337	\N	ACS (Independent)	2000	\N	f	107	\N	2026-01-25 08:50:38.109	2026-01-25 08:50:38.109
cmk7ypuec002gui2bk3te7ykw	Oldham Lodge (Chen Show Mao)	smchen2022@gmail.com	98340360	\N	ACS (Barker)	1977	\N	f	6839	\N	2026-01-10 07:07:12.804	2026-01-10 07:20:58.191
cmk7z7qjn003kui2b4n01jliw	Johnson Chen - Table2	jzxchen@gmail.com	96600660	\N	ACSS 	1988	\N	f	11435	\N	2026-01-10 07:21:07.619	2026-01-10 07:26:51.871
cmk800qly0040ui2bgckn6qk3	Chien yow iie	gsx323@gmail.com	96392756	\N	Acs	1993	\N	f	8769	\N	2026-01-10 07:43:40.726	2026-01-10 07:43:40.726
cmk80sg97004wui2bymnctwf6	Peng-Tiam Ang	pengtiam@gmail.com	86292909	\N	ACS (Barker)	1976	\N	f	3860	\N	2026-01-10 08:05:13.675	2026-01-10 08:05:13.675
cmkalss86000olxy39c31veqh	Ho Cheun Hon	cheunhonho@gmail.com	96556751	\N	ACSS 	1991	\N	f	7860	\N	2026-01-12 03:28:53.478	2026-01-12 03:28:53.478
cmk80qkw6004oui2bacs4iwgd	Ian Lin	nilnai@gmail.com	91443894	\N	ACS (Independent)	2007	\N	f	8028	\N	2026-01-10 08:03:46.374	2026-01-10 08:21:09.287
cmk81wsk5005kui2b1cmbyhq1	Goh Yen Hang	gohyenhang@gmail.com	98991611	\N	ACS Independent	2012	\N	f	11721	\N	2026-01-10 08:36:35.861	2026-01-10 08:36:35.861
cmk82ap01005sui2bn8efk5lb	Manraj Sekhon	manraj.sekhon@hotmail.com	91859808	\N	ACJC	1987	\N	f	3919	\N	2026-01-10 08:47:24.433	2026-01-10 08:47:24.433
cmk866jcj0060ui2btkhfjj6b	Christopher Chong	chris@chong.com.sg	96336000	\N	ACS Secondary	1982	\N	f	3823	\N	2026-01-10 10:36:08.948	2026-01-10 10:36:08.948
cmkaysdcj0000aq27p6nsftan	Glenn Foo	glenn.david.foo@gmail.com	98440298	\N	ACS	1992	\N	f	4666	\N	2026-01-12 09:32:29.203	2026-01-12 09:32:29.203
cmk7xbe0c000gui2bk1g5dcbb	Keith Hsu	keith.hsu@gmail.com	98554559	\N	ACS Barker	2004	\N	f	10237	\N	2026-01-10 06:27:58.764	2026-01-10 15:08:39.644
cmk8xrdxm0000dycsyz6uugdp	Lai Siang Hui	fmlaish@yahoo.co.uk	98286401	\N	ACS Barker	1985	\N	f	5375	\N	2026-01-10 23:28:11.338	2026-01-10 23:28:11.338
cmk9294c1000gdycss1trreqi	chok sing ping	chok.sing.ping@gmail.com	97641011	\N	Acs(i)	2001	\N	f	6902	\N	2026-01-11 01:33:57.17	2026-01-11 01:33:57.17
cmk92lhpn000odycs0vlsq0xn	Adam Tan	adam@plcc.sg	90072727	\N	Oldham Rugby	2000	\N	f	6649	\N	2026-01-11 01:43:34.379	2026-01-11 01:43:34.379
cmktkiw5o0000htnwwa69zq00	Mohan Balagopal	mbgopal@singnet.com.sg	90998955	\N	ACS (Barker Road)	1979	\N	f		\N	2026-01-25 10:00:49.741	2026-01-25 10:00:49.741
cmk97r7bh0000i0nstwvjer90	JOHN LOH MING REN	johnlohmr@gmail.com	98790123	\N	ACS (Independent)	2005	\N	f	6901	\N	2026-01-11 04:07:58.925	2026-01-11 04:07:58.925
cmk8yo03i0008dycsgg5qcx7v	Kee Kirk Chin	keekirkchin@gmail.com	96228588	\N	ACPS 1973 ACS 1977 ACJC 1979	1977	\N	f		\N	2026-01-10 23:53:33.055	2026-01-11 05:16:05.269
cmktsoy7w0000rvmcjum3js0y	LEON WAI	leonwhy@gmail.com	97854881	\N	ACJC	2006	\N	f		\N	2026-01-25 13:49:29.276	2026-01-25 13:49:29.276
cmkb7k4k70000wr8s0xyfvzf6	Ong Chun Hian James	ongchj@gmail.com	+6593685125	\N	ACS(Independent)	1999	\N	f	9575	\N	2026-01-12 13:38:01.111	2026-01-12 13:38:01.111
cmkc1ct3h0000kpykf5gcpwix	Mingcheng Lim	mingcheng.lim@gmail.com	98237372	\N	ACS (Independent)	1999	\N	f	5685	\N	2026-01-13 03:32:08.141	2026-01-13 03:32:08.141
cmkc1lum30008kpykprh7xu9y	Livingstone Chew	livingstonechew@gmail.com	90622891	\N	Acs	1993	\N	f	4752	\N	2026-01-13 03:39:10.012	2026-01-13 03:39:10.012
cmkcao96h0000wx2kuxlfnlqj	Low Yang Tong	yt.low@aes-asia.com	98339115	\N	ACSS	1973	\N	f	3552	\N	2026-01-13 07:52:58.745	2026-01-13 07:52:58.745
cmkcchxpk0008wx2k73wf47fs	Jonathan Quek	jquek@rtnq.com	91188323	\N	ACS Independent	1996	\N	f	6262	\N	2026-01-13 08:44:03.177	2026-01-13 08:44:03.177
cmkcffpr70000170gd4vj1j1n	Tan Suan Wee	suanwee@gmail.com	98198936	\N	ACS	1986	\N	f	7051	\N	2026-01-13 10:06:18.403	2026-01-13 10:06:18.403
cmkc8fha0000b7hgnljzze2lf	Chan Kok Yew	chankokyew@gmail.com	96702035	\N	ACSS	1984	\N	f	4682	\N	2026-01-13 06:50:10.104	2026-01-13 11:02:25.897
cmk8049oh0048ui2bic2uc9zx	Ravi Alfreds	ravialfreds@gmail.com	98420225	\N	For Dilhan Pillay Sandrasegara	1900	\N	f	8335	\N	2026-01-10 07:46:25.409	2026-01-13 11:13:52.948
cmkhxtywo00005x6d88yf4xig	Goh Yen Hang	iangohyenhang@gmail.com	98991611	\N	ACS Independent	2012	\N	f	11721	\N	2026-01-17 06:40:07.416	2026-01-17 06:40:07.416
cmkm3j4gz0001n94gjnlewudy	Jayaram Ganga	Jayaram_GANGA@schools.gov.sg	67750511	\N	ACJC	\N	\N	f		\N	2026-01-20 04:30:43.812	2026-01-20 04:30:43.812
cmkm8mju800004lkv2gdn6gmc	DANIEL CHONG WOON CHIEH	daniel.chong@aagroup.sg	96917454	\N	ACSS	1989	\N	f		\N	2026-01-20 06:53:21.776	2026-01-20 06:53:21.776
cmknif3n50000149srf9p8ssw	Dominic Lee	domleeky@yahoo.com.sg	90669666	\N	ACS	1990	\N	f	12373	\N	2026-01-21 04:15:16.529	2026-01-21 04:15:16.529
cmknvl7qd0000pbfgz04rf1e5	Francis Chua	francis@metafusion.com.sg	90936570	\N	ACS Barker	1978	\N	f		\N	2026-01-21 10:23:56.773	2026-01-21 10:23:56.773
cmkqd9wwl00005parerxb04m0	rrr	rrr@gmail.com	rrrrrrr	\N	ACS Primary	\N	\N	f		\N	2026-01-23 04:14:34.966	2026-01-23 04:14:34.966
cmkt8a8lf0000kyqatlzywihm	Ryan Jacob	ryanthomasjacob@gmail.com	96920307	\N	ACS Independent 	1997	\N	f	8546	\N	2026-01-25 04:18:10.563	2026-01-25 04:18:10.563
cmkwp6y060000wqesv8pv0z2c	Wong Heng Yu	hengyuwong@yahoo.com.sg	92342610	\N	ACS Acad Board Table- anonymous donation	2026	\N	f	4361	\N	2026-01-27 14:34:48.87	2026-01-27 14:34:48.87
cmkukjtfg0000l7ioxkt7tmlx	Edmund Tang 	edmundcktang7@gmail.com	96929293	\N	ACS Secondary	1989	\N	f	103	\N	2026-01-26 02:49:19.036	2026-01-26 02:49:19.036
cmkuqnbwm0000vs5fwwmx2oi2	Quek	clearroads@gmail.com	83534732	\N	ACS Independent	1994	\N	f	12530	\N	2026-01-26 05:40:00.647	2026-01-26 05:47:47.84
cmkf4r389000014a2vy3rk5cm	Helena Lim	helena.lim@theacsfoundation.org	92342909	\N	The ACS Foundation	2025	\N	f	No membership Number	\N	2026-01-15 07:30:31.833	2026-01-26 06:39:40.77
cmkuvol7e0000t2gmsozrjnv6	Jason Ho	jason@strengthsschool.com	97566038	\N	ACSBR	1998	\N	f	7230	\N	2026-01-26 08:00:57.435	2026-01-26 08:00:57.435
cmkvw3kf8000010sdxo3hjd3o	Loke Wai San	wai.loke@gmail.com	96158011	\N	ACSS	1984	\N	f	5377	\N	2026-01-27 01:00:22.436	2026-01-27 01:00:22.436
cmkc7poi800017hgndlgvliy0	Admin	admin@acsoba.org	80448689	\N	ACS Independent	\N	\N	f		\N	2026-01-13 06:30:06.415	2026-01-27 13:58:23.237
cmkwqn2gb0008wqeshaf8d9bs	Chan Wei Yao	weiyaochan@rocketmail.com	85221823	\N	ACS(I)	2016	\N	f	12733	\N	2026-01-27 15:15:20.747	2026-01-27 15:15:20.747
cmkxr56950000mh6kzc20iutf	ACS BARKER	admin+acsbr@acsoba.org		\N	ACS Barker Road	\N	\N	f		\N	2026-01-28 08:17:11.657	2026-01-28 08:17:11.657
cmkglkjjz00009zunojnmyhxo	Arthur	arthurlhlee@gmail.com	91522299	\N	ACS (Independent)	2015	\N	f	11923	\N	2026-01-16 08:09:06.047	2026-01-29 07:41:08.625
cmkz5rxxt000810z098c0nx44	SEAH ING HONG JERAENA	JKHOOSAN@GMAIL.COM	97737530	\N	ACJC 	1994	\N	f	6005	\N	2026-01-29 07:54:34.769	2026-01-29 08:32:24.585
cmkz8y85w00085yv73yg3o97j	asdf	asdf@agmai.com	sdf	\N	ACS Junior	\N	\N	f	123	\N	2026-01-29 09:23:26.804	2026-01-29 09:23:26.804
cmkz8zeq4000g5yv71ag4oo2g	asdf	sdfad@cmia.com	1239128u3	\N	ACS Junior	\N	\N	f	123213	\N	2026-01-29 09:24:21.964	2026-01-29 09:24:21.964
cmkz9i6i50000qb8097g398kt	test	test@gmail.com	567890	\N	ACS Independent	\N	\N	f	123	\N	2026-01-29 09:38:57.774	2026-01-29 09:38:57.774
cmkz9j2mj000aqb802e2m2xan	mi	mi@gmail.com	214134	\N	ACS International	\N	\N	f		\N	2026-01-29 09:39:39.403	2026-01-29 09:39:39.403
cmkz9la4g000iqb80u9wa4k9x	test	test@test.com	123123	\N	ACS Independent	\N	\N	f	12312312	\N	2026-01-29 09:41:22.433	2026-01-29 09:41:22.433
cmkzb7dkh0000bk789zivaybs	Ngoei Wen Qing 	ngoei.wq@gmail.com	88589049	\N	Acjc 	1994	\N	f	8029	\N	2026-01-29 10:26:32.945	2026-01-29 10:26:32.945
cml2bl7hb0000nb572lg1o30u	Abel	abel9999@hotmail.com	96465416	\N	Acs Barker Road	2003	\N	f	9255	\N	2026-01-31 13:00:36.768	2026-01-31 13:00:36.768
\.


--
-- Data for Name: inventory_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, type, category, quantity, "totalAmount", "transactionFee", "balanceDue", "hitpayPaymentId", status, "buyerId", "voucherId", "wantsBatchSeating", school, "gradYear", cuisine, "createdAt", "updatedAt") FROM stdin;
cmk9a6sdu000di0nshcl9wma5	TABLE	OBA	1	2300.00	0.00	2300.00	a0cefc4c-66dd-4ad0-90c4-ff59fc742564	PAID	cmk8yo03i0008dycsgg5qcx7v	\N	t	\N	\N	["Chinese"]	2026-01-11 05:16:05.299	2026-01-11 05:18:01.575
cmk7ychrr001vui2bxjk501sx	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd1d57-afb3-4652-b969-ea3ed4e9d491	PAID	cmk7ychqy001sui2bo76vpyui	\N	t	\N	\N	["Chinese"]	2026-01-10 06:56:49.911	2026-01-10 07:02:54.525
cmknvl7r60003pbfg40vrpwb9	TABLE	OBA	1	2300.00	0.00	2300.00	a0e3883c-fa29-4e53-958f-14ec92796938	PAID	cmknvl7qd0000pbfgz04rf1e5	\N	t	\N	\N	["Chinese"]	2026-01-21 10:23:56.802	2026-01-21 10:26:22.87
cmk7y2qvu001nui2b2qd6hg6u	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd1aa2-178c-4797-85cd-917b589be5e0	PAID	cmk7x73rr0000ui2b09yf17hx	\N	t	\N	\N	["Chinese"]	2026-01-10 06:49:15.163	2026-01-10 07:05:31.384
cmk9bh02m000li0nshx7ei753	TABLE	OBA	5	10500.00	0.00	10500.00	a0cf0926-81b3-4ca4-91b1-17db5b15ba20	PAID	cmk8049oh0048ui2bic2uc9zx	\N	t	\N	\N	["Chinese","Chinese","Chinese","Chinese","Chinese"]	2026-01-11 05:52:01.438	2026-01-11 05:53:21.83
cmkt8a8me0003kyqail82czm8	TABLE	OBA	1	2100.00	0.00	2100.00	a0eb115d-77f4-4b3a-adb0-75a9aa7f1e07	PAID	cmkt8a8lf0000kyqatlzywihm	\N	t	\N	\N	["Chinese"]	2026-01-25 04:18:10.598	2026-01-25 06:06:33.582
cmkae207l000311wahocafb13	SEAT	OBA	1	230.00	0.00	230.00	a0d08b6b-849a-464d-8b6d-830895476ccc	PAID	cmkae206s000011waxjej24wx	\N	t	\N	\N	["Chinese"]	2026-01-11 23:52:06.801	2026-01-11 23:52:38.126
cmk7z7qkp003nui2b8p87g23m	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd2608-1394-46ce-a4da-d560a0635279	PAID	cmk7z7qjn003kui2b4n01jliw	\N	t	\N	\N	["Chinese"]	2026-01-10 07:21:07.656	2026-01-10 07:25:24.496
cmk7z7jai003dui2bcjaxr4cx	TABLE	OBA	2	4200.00	0.00	4200.00	a0cd25f9-a6b1-4331-8302-a8734f481096	PAID	cmk7ypuec002gui2bk3te7ykw	\N	t	\N	\N	["Chinese","Chinese"]	2026-01-10 07:20:58.218	2026-01-10 07:25:55.975
cmkaimg270003lxy3fkj45p1j	TABLE	OBA	1	2300.00	0.00	2300.00	a0d0b926-50ba-4daf-84d1-8447a6209541	PAID	cmk932e7f000014nk6gqzn997	\N	t	\N	\N	["Chinese"]	2026-01-12 01:59:58.927	2026-01-12 02:03:43.486
cmk7zf46y003vui2bi3au5lv9	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd2815-66ca-4e4e-91a9-896d1dd12c5c	PAID	cmk7z7qjn003kui2b4n01jliw	\N	t	\N	\N	["Chinese"]	2026-01-10 07:26:51.898	2026-01-10 07:27:11.913
cmkc7poj800047hgnz1a84mm6	TABLE	OBA	2	0.00	0.00	0.00	\N	PAID	cmkc7poi800017hgndlgvliy0	cmkc7njm500007hgnrx1q3u4b	t	\N	\N	["Chinese","Chinese"]	2026-01-13 06:30:06.452	2026-01-27 13:44:35.843
cmkc1lunh000bkpykzlfsd1gq	TABLE	OBA	2	4200.00	0.00	4200.00	a0d2df9a-e594-4eda-89d8-219dea728839	PAID	cmkc1lum30008kpykprh7xu9y	\N	t	\N	\N	["Chinese","Chinese"]	2026-01-13 03:39:10.06	2026-01-31 17:06:48.636
cmkajl9xm000blxy3wfvp4q1y	TABLE	OBA	1	2100.00	0.00	2100.00	a0d0c2d5-d36b-4c5f-ae7c-b1a9fb8bdeed	PAID	cmkajl9ws0008lxy39zqi403f	\N	t	\N	\N	["Chinese"]	2026-01-12 02:27:03.946	2026-01-12 02:28:15.617
cmkajosul000jlxy3kb0a3h6u	TABLE	OBA	1	2100.00	0.00	2100.00	a0d0c3d0-ffe8-4a9c-93f3-03cd25981b3c	PAID	cmk8049oh0048ui2bic2uc9zx	\N	t	\N	\N	["Chinese"]	2026-01-12 02:29:48.429	2026-01-12 02:31:16.125
cmkalss8y000rlxy36haub54z	TABLE	OBA	1	2100.00	0.00	2100.00	a0d0d8f2-3039-4a17-aee2-1d080e20928a	PAID	cmkalss86000olxy39c31veqh	\N	t	\N	\N	["Chinese"]	2026-01-12 03:28:53.506	2026-01-14 12:54:19.78
cmk7xchb8000rui2bqf9hcvnz	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd1353-daf6-407b-89eb-c9c9589dbc41	PAID	cmk7xchap000oui2bsagbvsy4	\N	t	\N	\N	["Chinese"]	2026-01-10 06:28:49.7	2026-01-10 06:32:04.612
cmk82ap0u005vui2bhgiqlwb8	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd44e3-54a4-4724-a795-62607515c623	PAID	cmk82ap01005sui2bn8efk5lb	\N	t	\N	\N	["Halal"]	2026-01-10 08:47:24.462	2026-01-10 08:48:19.797
cmkaysddf0003aq27krhojpc9	TABLE	OBA	1	2100.00	0.00	2100.00	a0d15afa-a31d-4fb5-82d7-56cc3fe1322a	PAID	cmkaysdcj0000aq27p6nsftan	\N	t	\N	\N	["Chinese"]	2026-01-12 09:32:29.235	2026-01-12 09:35:00.189
cmk7xuqx70017ui2bshy7dxvf	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd1868-6b19-40bb-99e3-6e8729ffd343	PAID	cmk7x73rr0000ui2b09yf17hx	\N	t	\N	\N	["Chinese"]	2026-01-10 06:43:01.963	2026-01-10 06:47:54.136
cmk8xrdyl0003dycscmgqdluw	TABLE	OBA	1	2100.00	0.00	2100.00	a0ce7fe1-6f5c-4372-832a-3c7e8cf95a3e	PAID	cmk8xrdxm0000dycsyz6uugdp	\N	t	\N	\N	["Chinese"]	2026-01-10 23:28:11.373	2026-01-10 23:29:52.88
cmk7xumw3000zui2bhuz6xq02	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd1860-6f19-49a0-994d-0327eab40552	PAID	cmk7xumvd000wui2bctl2ufey	\N	t	\N	\N	["Chinese"]	2026-01-10 06:42:56.74	2026-01-10 06:44:23.545
cmk7y0fav001fui2bug20xq6m	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd19fc-7d7e-47e5-ae8e-d9efcd8c3dc4	PAID	cmk7y0fac001cui2b0lop06la	\N	t	\N	\N	["Chinese"]	2026-01-10 06:47:26.839	2026-01-10 09:04:50.94
cmkb7k4l50003wr8stem0cwmy	TABLE	OBA	1	2100.00	0.00	2100.00	a0d1b2c9-95d9-4870-998a-0e350524532b	PAID	cmkb7k4k70000wr8s0xyfvzf6	\N	t	\N	\N	["Chinese"]	2026-01-12 13:38:01.145	2026-01-12 13:39:29.018
cmk866jd90063ui2b0j30o721	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd6bc6-e9b3-4b93-b7e7-0ad4d64421fa	PAID	cmk866jcj0060ui2btkhfjj6b	\N	t	\N	\N	["Chinese"]	2026-01-10 10:36:08.973	2026-01-10 10:37:49.306
cmk81wskv005nui2b0kv6d9f3	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd4105-9ea7-4d52-b929-e2968feec693	PAID	cmk81wsk5005kui2b1cmbyhq1	\N	t	\N	\N	["Chinese"]	2026-01-10 08:36:35.887	2026-01-10 10:55:42.7
cmkcao97g0003wx2k6aryrkpe	TABLE	OBA	1	2100.00	0.00	2100.00	a0d33a60-1658-4d1c-81b2-ec08419e1fa8	PAID	cmkcao96h0000wx2kuxlfnlqj	\N	t	\N	\N	["Chinese"]	2026-01-13 07:52:58.78	2026-01-16 13:27:25.161
cmk8fwzn9000b10sijgg4edxx	TABLE	OBA	1	2100.00	0.00	2100.00	a0cdcd3c-0b6e-4148-a01b-96211e625fbc	PAID	cmk7xbe0c000gui2bk1g5dcbb	\N	t	\N	\N	["Chinese"]	2026-01-10 15:08:39.669	2026-01-10 15:11:45.557
cmk81cxmq005fui2bhvf8yk3d	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd3b7f-d0f8-4ecc-8133-8789621392f3	PAID	cmk80qkw6004oui2bacs4iwgd	\N	t	\N	\N	["Chinese"]	2026-01-10 08:21:09.314	2026-01-10 15:16:57.165
cmkc1ct4g0003kpykut5mfad7	TABLE	OBA	1	2100.00	0.00	2100.00	a0d2dd17-2a0f-4fe6-8a56-e5dd5c8b9dd7	PAID	cmkc1ct3h0000kpykf5gcpwix	\N	t	\N	\N	["Chinese"]	2026-01-13 03:32:08.176	2026-01-13 03:33:14.375
cmk9294cu000jdycs6v2st1xu	TABLE	OBA	1	2100.00	0.00	2100.00	a0ceacdb-2e15-4e34-a784-1b501c189a59	PAID	cmk9294c1000gdycss1trreqi	\N	t	\N	\N	["Chinese"]	2026-01-11 01:33:57.198	2026-01-11 01:35:15.364
cmk97r7cn0003i0ns55zvrewo	TABLE	OBA	2	4200.00	0.00	4200.00	a0cee3f1-22cd-4b16-b4e3-afe8d232c646	PAID	cmk97r7bh0000i0nstwvjer90	\N	t	\N	\N	["Chinese","Chinese"]	2026-01-11 04:07:58.967	2026-01-11 04:09:38.778
cmkcchxqd000bwx2kadm9g3ok	TABLE	OBA	10	21000.00	0.00	21000.00	a0d34ca4-2f8a-403c-8cc4-07afa7aa7358	PAID	cmkcchxpk0008wx2k73wf47fs	\N	t	\N	\N	["Chinese","Chinese","Chinese","Chinese","Chinese","Chinese","Chinese","Chinese","Chinese","Chinese"]	2026-01-13 08:44:03.205	2026-01-13 09:09:39.356
cmkcffpsa0003170g2c6ndobq	TABLE	OBA	1	2100.00	0.00	2100.00	a0d36a0e-9a78-4b8f-a016-52473a95c4f2	PAID	cmkcffpr70000170gd4vj1j1n	\N	t	\N	\N	["Chinese"]	2026-01-13 10:06:18.442	2026-01-13 10:07:48.908
cmkchfw5r000b170gn7xze5it	TABLE	OBA	1	2100.00	0.00	2100.00	a0d37e20-f61b-4474-bf65-e3b2b585604e	PAID	cmkc8fha0000b7hgnljzze2lf	\N	t	\N	\N	["Chinese"]	2026-01-13 11:02:25.935	2026-01-13 11:04:07.55
cmkchumaa000j170ghqwumsd0	TABLE	OBA	1	2100.00	0.00	2100.00	a0d38239-5abb-4dae-85ef-827e3985f099	PAID	cmk8049oh0048ui2bic2uc9zx	\N	t	\N	\N	["Chinese"]	2026-01-13 11:13:52.978	2026-01-13 11:15:56.873
cmk80sg9p004zui2bnky03p0a	TABLE	OBA	1	2100.00	0.00	2100.00	a0cd35cd-8a91-4e85-8b2c-686d34cf8357	PAID	cmk80sg97004wui2bymnctwf6	\N	t	\N	\N	["Chinese"]	2026-01-10 08:05:13.693	2026-01-14 00:37:37.395
cmk92lhqh000rdycso3pr1e6x	TABLE	OBA	5	10500.00	0.00	10500.00	a0ceb04b-ff38-4b00-8dde-f09d66dab16e	PAID	cmk92lhpn000odycs0vlsq0xn	\N	t	\N	\N	["Chinese","Chinese","Chinese","Chinese","Chinese"]	2026-01-11 01:43:34.409	2026-01-16 02:19:49.949
cmkf4r39d000314a2xvt5th8b	TABLE	OBA	2	4200.00	0.00	4200.00	a0d73850-ed82-422b-9ba8-d1d715e3cc6e	PAID	cmkf4r389000014a2vy3rk5cm	\N	t	\N	\N	["Chinese","Chinese"]	2026-01-15 07:30:31.873	2026-01-15 07:33:32.046
cmkglkjky00039zunxdff9th1	TABLE	OBA	1	2100.00	0.00	2100.00	a0d94917-d496-49e3-b54a-499842089dd3	PAID	cmkglkjjz00009zunojnmyhxo	\N	t	\N	\N	["Chinese"]	2026-01-16 08:09:06.082	2026-01-16 08:11:39.672
cmkti0mgx0003w69munrvdsej	TABLE	OBA	1	2100.00	0.00	2100.00	a0eb72cd-f124-48e0-b1be-aff42dfff15c	PAID	cmkti0mfx0000w69muyyv932i	\N	t	\N	\N	["Chinese"]	2026-01-25 08:50:38.145	2026-01-25 08:52:41.817
cmktsoy8n0003rvmc6qjj7qo2	SEAT	OBA	2	460.00	0.00	460.00	a0ebddae-a297-40cd-ab5d-2f243c60836d	PAID	cmktsoy7w0000rvmcjum3js0y	\N	t	\N	\N	["Chinese","Chinese"]	2026-01-25 13:49:29.303	2026-01-25 13:50:41.44
cmkm3j4ht0004n94gr672c8us	TABLE	OBA	2	0.00	0.00	0.00	\N	PAID	cmkm3j4gz0001n94gjnlewudy	cmkm3g9410000n94gugl77bwx	t	\N	\N	["Chinese","Chinese"]	2026-01-20 04:30:43.841	2026-01-20 07:46:48.914
cmkm8mjv600034lkvajv6r7zu	TABLE	OBA	1	2300.00	0.00	2300.00	a0e139f1-9874-4af1-9e62-6b95dcb50e20	PAID	cmkm8mju800004lkv2gdn6gmc	\N	t	\N	\N	["Chinese"]	2026-01-20 06:53:21.809	2026-01-20 13:34:14.133
cmknif3o50003149ssbkhpddz	TABLE	OBA	3	6300.00	0.00	6300.00	a0e30464-5ed4-4bc9-a520-4f362289c228	PAID	cmknif3n50000149srf9p8ssw	\N	t	\N	\N	["Chinese","Chinese","Chinese"]	2026-01-21 04:15:16.565	2026-01-21 04:16:47.351
cmkukjtga0003l7ioyzq6lr1j	TABLE	OBA	1	2100.00	0.00	2100.00	a0ecf492-278f-46cf-be3e-fdf961377219	PAID	cmkukjtfg0000l7ioxkt7tmlx	\N	t	\N	\N	["Chinese"]	2026-01-26 02:49:19.067	2026-01-26 02:50:03.075
cmkuqxcew000bvs5ftqr0wi25	TABLE	OBA	1	2100.00	0.00	2100.00	a0ed3466-68bb-4fb5-bb03-f8412c7ee8ff	PAID	cmkuqnbwm0000vs5fwwmx2oi2	\N	t	\N	\N	["Chinese"]	2026-01-26 05:47:47.865	2026-01-26 05:49:30.335
cmkuss2df000313sm5ucqjt60	TABLE	OBA	1	2100.00	0.00	2100.00	a0ed46f4-75e1-402a-aaf6-7c055323d23e	PAID	cmkf4r389000014a2vy3rk5cm	\N	t	\N	\N	["Chinese"]	2026-01-26 06:39:40.803	2026-01-26 06:41:04.309
cmkuvol8g0003t2gmqyerw47o	TABLE	OBA	2	4200.00	0.00	4200.00	a0ed6405-b013-429e-aed7-5a0596b96b4e	PAID	cmkuvol7e0000t2gmsozrjnv6	\N	t	\N	\N	["Chinese","Chinese"]	2026-01-26 08:00:57.471	2026-01-26 08:01:39.902
cmkvw3kg3000310sdi1ahicd1	TABLE	OBA	1	2100.00	0.00	2100.00	a0eed098-1daf-4d28-b2dd-fa36f6642c67	PAID	cmkvw3kf8000010sdxo3hjd3o	\N	t	\N	\N	["Chinese"]	2026-01-27 01:00:22.467	2026-01-27 01:01:34.742
cmkwnqvj30004fdy0f13oc2jn	TABLE	OBA	3	0.00	0.00	0.00	\N	PAID	cmkc7poi800017hgndlgvliy0	cmkwn6ln40000fdy02ijj31hm	t	\N	\N	["Chinese","Chinese","Chinese"]	2026-01-27 13:54:19.552	2026-01-27 13:54:22.411
cmkwns3nf000gfdy0c33tagkd	TABLE	OBA	2	0.00	0.00	0.00	\N	PAID	cmkc7poi800017hgndlgvliy0	cmkwn6ln40000fdy02ijj31hm	t	\N	\N	["Chinese","Chinese"]	2026-01-27 13:55:16.731	2026-01-27 13:55:55.481
cmkwnw3km0011fdy0oh60d8rr	TABLE	OBA	2	0.00	0.00	0.00	\N	PAID	cmkc7poi800017hgndlgvliy0	cmkwn6ln40000fdy02ijj31hm	t	\N	\N	["Chinese","Chinese"]	2026-01-27 13:58:23.254	2026-01-27 13:58:25.935
cmkwp6y130003wqesu0simwgy	TABLE	OBA	1	2100.00	0.00	2100.00	a0eff3dc-6843-4078-8727-ba5c5f512846	PAID	cmkwp6y060000wqesv8pv0z2c	\N	t	\N	\N	["Chinese"]	2026-01-27 14:34:48.903	2026-01-27 14:37:06.11
cmkwqn2h1000bwqese5136o5v	SEAT	OBA	1	230.00	0.00	230.00	a0f0025b-266f-43bf-818e-80f019b2b597	PAID	cmkwqn2gb0008wqeshaf8d9bs	\N	t	\N	\N	["Chinese"]	2026-01-27 15:15:20.773	2026-01-27 15:16:57.061
cmkz74ld600035yv7gx3l1m97	TABLE	OBA	1	2100.00	0.00	2100.00	a0f37839-2015-4eed-a24d-e016a145cffc	PAID	cmkz5rxxt000810z098c0nx44	\N	t	\N	\N	["Chinese"]	2026-01-29 08:32:24.618	2026-01-29 08:34:00.869
cmkxr56al0003mh6kibihu1iw	TABLE	OBA	3	0.00	0.00	0.00	\N	PAID	cmkxr56950000mh6kzc20iutf	cmkwn6ln40000fdy02ijj31hm	t	\N	\N	["Chinese","Chinese","Chinese"]	2026-01-28 08:17:11.709	2026-01-28 08:19:18.182
cmkz5anxr000310z0wew8w2io	TABLE	OBA	1	2100.00	0.00	2100.00	a0f365e3-81b7-4681-954a-48f54748fea2	PAID	cmkglkjjz00009zunojnmyhxo	\N	t	\N	\N	["Chinese"]	2026-01-29 07:41:08.655	2026-01-29 10:27:11.895
cmkzb7dll0003bk78q1l7b6rl	TABLE	OBA	1	2100.00	0.00	2100.00	a0f3a10a-c96d-4279-9e9c-0396a3a5a888	PAID	cmkzb7dkh0000bk789zivaybs	\N	t	\N	\N	["Chinese"]	2026-01-29 10:26:32.985	2026-01-29 10:28:00.051
cmkwnu8l0000rfdy0dpzibw76	TABLE	OBA	1	0.00	0.00	0.00	\N	PAID	cmkc7poi800017hgndlgvliy0	cmkwn6ln40000fdy02ijj31hm	t	\N	\N	["Chinese"]	2026-01-27 13:56:56.437	2026-01-27 13:56:59.412
cml2bl7ij0003nb57rnt8mtbe	TABLE	OBA	1	2100.00	0.00	2100.00	a0f7de1b-a89d-4092-9f62-b6f08c51b112	PAID	cml2bl7hb0000nb572lg1o30u	\N	t	\N	\N	["Chinese"]	2026-01-31 13:00:36.811	2026-02-01 09:03:45.549
\.


--
-- Data for Name: email_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invite_codes (id, code, "bookingId", "guestId", email, "claimedAt", "expiresAt", "createdAt", "updatedAt") FROM stdin;
cml2bl7j30007nb575kinl9ri	7TLBSVYX	cml2bl7ij0003nb57rnt8mtbe	\N	abel9999@hotmail.com	\N	\N	2026-01-31 13:00:36.832	2026-01-31 13:00:36.832
cmk7xchbp000vui2boq94mwcd	975UDY6U	cmk7xchb8000rui2bqf9hcvnz	\N	kwekwm@hotmail.com	\N	\N	2026-01-10 06:28:49.718	2026-01-10 06:28:49.718
cmk7xumwz0013ui2bu184vzsu	H67H65AR	cmk7xumw3000zui2bhuz6xq02	\N	mail@ericchen.org	\N	\N	2026-01-10 06:42:56.772	2026-01-10 06:42:56.772
cmk7xuqxo001bui2beqytzel6	FC383JPJ	cmk7xuqx70017ui2bshy7dxvf	\N	ark.yap@gmail.com	\N	\N	2026-01-10 06:43:01.981	2026-01-10 06:43:01.981
cmk7y0fb9001jui2b7ceaxq0h	ESXU84BN	cmk7y0fav001fui2bug20xq6m	\N	teohsurg@gmail.com	\N	\N	2026-01-10 06:47:26.854	2026-01-10 06:47:26.854
cmk7y2qws001rui2b2rinqyqx	4D5JF6BD	cmk7y2qvu001nui2b2qd6hg6u	\N	ark.yap@gmail.com	\N	\N	2026-01-10 06:49:15.196	2026-01-10 06:49:15.196
cmk7ychsd001zui2bnm3khu3j	9HJPLUE4	cmk7ychrr001vui2bxjk501sx	\N	taylplm7@gmail.com	\N	\N	2026-01-10 06:56:49.934	2026-01-10 06:56:49.934
cmk7z7jb2003hui2bt3ffv7eu	G8WG6A5P	cmk7z7jai003dui2bcjaxr4cx	\N	smchen2022@gmail.com	\N	\N	2026-01-10 07:20:58.238	2026-01-10 07:20:58.238
cmk7z7jba003jui2bwmn248qg	FMP3SDPR	cmk7z7jai003dui2bcjaxr4cx	\N	smchen2022@gmail.com	\N	\N	2026-01-10 07:20:58.247	2026-01-10 07:20:58.247
cmk7z7ql4003rui2b0xpker7e	V63YWZM2	cmk7z7qkp003nui2b8p87g23m	\N	jzxchen@gmail.com	\N	\N	2026-01-10 07:21:07.673	2026-01-10 07:21:07.673
cmk7zf47i003zui2babxfoifa	TNE2WN5B	cmk7zf46y003vui2bi3au5lv9	\N	jzxchen@gmail.com	\N	\N	2026-01-10 07:26:51.918	2026-01-10 07:26:51.918
cmk80sga20053ui2b4oo7euar	77ZCTT42	cmk80sg9p004zui2bnky03p0a	\N	pengtiam@gmail.com	\N	\N	2026-01-10 08:05:13.706	2026-01-10 08:05:13.706
cmk81cxnb005jui2buj83079o	WSVUXSYE	cmk81cxmq005fui2bhvf8yk3d	\N	nilnai@gmail.com	\N	\N	2026-01-10 08:21:09.335	2026-01-10 08:21:09.335
cmk81wslf005rui2b09170x2i	E4ZLUEFJ	cmk81wskv005nui2b0kv6d9f3	\N	gohyenhang@gmail.com	\N	\N	2026-01-10 08:36:35.907	2026-01-10 08:36:35.907
cmk82ap1j005zui2bcny6go3o	PWYKPQUH	cmk82ap0u005vui2bhgiqlwb8	\N	manraj.sekhon@hotmail.com	\N	\N	2026-01-10 08:47:24.488	2026-01-10 08:47:24.488
cmk866jdt0067ui2b7ogz26ep	PTP33RAK	cmk866jd90063ui2b0j30o721	\N	chris@chong.com.sg	\N	\N	2026-01-10 10:36:08.993	2026-01-10 10:36:08.993
cmk8fwzno000f10sidrwy39yq	QRR4F6RZ	cmk8fwzn9000b10sijgg4edxx	\N	keith.hsu@gmail.com	\N	\N	2026-01-10 15:08:39.684	2026-01-10 15:08:39.684
cmk8xrdz80007dycs944abj1d	AZVY3EX7	cmk8xrdyl0003dycscmgqdluw	\N	fmlaish@yahoo.co.uk	\N	\N	2026-01-10 23:28:11.396	2026-01-10 23:28:11.396
cmk9294dh000ndycsdvinj5az	BJSMLURR	cmk9294cu000jdycs6v2st1xu	\N	chok.sing.ping@gmail.com	\N	\N	2026-01-11 01:33:57.222	2026-01-11 01:33:57.222
cmk92lhr2000vdycskl5gjjxt	NPBQZVCP	cmk92lhqh000rdycso3pr1e6x	\N	adam@plcc.sg	\N	\N	2026-01-11 01:43:34.431	2026-01-11 01:43:34.431
cmk92lhrb000xdycsb24l5wlo	27GV253J	cmk92lhqh000rdycso3pr1e6x	\N	adam@plcc.sg	\N	\N	2026-01-11 01:43:34.44	2026-01-11 01:43:34.44
cmk92lhrh000zdycscby8cjaf	D525T9KU	cmk92lhqh000rdycso3pr1e6x	\N	adam@plcc.sg	\N	\N	2026-01-11 01:43:34.445	2026-01-11 01:43:34.445
cmk92lhrm0011dycsa9junpmt	Q7564RJM	cmk92lhqh000rdycso3pr1e6x	\N	adam@plcc.sg	\N	\N	2026-01-11 01:43:34.45	2026-01-11 01:43:34.45
cmk92lhrr0013dycskqzhynqp	ST8FWEZA	cmk92lhqh000rdycso3pr1e6x	\N	adam@plcc.sg	\N	\N	2026-01-11 01:43:34.455	2026-01-11 01:43:34.455
cmk97r7db0007i0nsjsovntx3	FZ28CFUV	cmk97r7cn0003i0ns55zvrewo	\N	johnlohmr@gmail.com	\N	\N	2026-01-11 04:07:58.991	2026-01-11 04:07:58.991
cmk97r7dl0009i0nsvsgf7qq8	BRL3CK29	cmk97r7cn0003i0ns55zvrewo	\N	johnlohmr@gmail.com	\N	\N	2026-01-11 04:07:59.002	2026-01-11 04:07:59.002
cmk9a6sei000hi0ns9kofzoot	SVHWPNPB	cmk9a6sdu000di0nshcl9wma5	\N	keekirkchin@gmail.com	\N	\N	2026-01-11 05:16:05.322	2026-01-11 05:16:05.322
cmk9bh033000pi0nsgmnfibzm	JHGANCGS	cmk9bh02m000li0nshx7ei753	\N	ravialfreds@gmail.com	\N	\N	2026-01-11 05:52:01.456	2026-01-11 05:52:01.456
cmk9bh03b000ri0nsk7lkajak	GJTZV2DA	cmk9bh02m000li0nshx7ei753	\N	ravialfreds@gmail.com	\N	\N	2026-01-11 05:52:01.464	2026-01-11 05:52:01.464
cmk9bh03h000ti0ns06bofb5j	PWFRXVPN	cmk9bh02m000li0nshx7ei753	\N	ravialfreds@gmail.com	\N	\N	2026-01-11 05:52:01.469	2026-01-11 05:52:01.469
cmk9bh03m000vi0nsp1tmuv2s	2E7D8TBU	cmk9bh02m000li0nshx7ei753	\N	ravialfreds@gmail.com	\N	\N	2026-01-11 05:52:01.474	2026-01-11 05:52:01.474
cmk9bh03r000xi0nskkxra257	NQGT9X3Q	cmk9bh02m000li0nshx7ei753	\N	ravialfreds@gmail.com	\N	\N	2026-01-11 05:52:01.479	2026-01-11 05:52:01.479
cmkae207x000511wah2yu55bl	GTF7AJ7T	cmkae207l000311wahocafb13	\N	pzhengji@gmail.com	\N	\N	2026-01-11 23:52:06.813	2026-01-11 23:52:06.813
cmkaimg2t0007lxy3stmx0yk7	34XFGMXS	cmkaimg270003lxy3fkj45p1j	\N	chiangyin@gmail.com	\N	\N	2026-01-12 01:59:58.949	2026-01-12 01:59:58.949
cmkajl9y6000flxy3ab770xhr	UPY9D2WH	cmkajl9xm000blxy3wfvp4q1y	\N	benyap83@gmail.com	\N	\N	2026-01-12 02:27:03.967	2026-01-12 02:27:03.967
cmkajosv3000nlxy3y3dvdkgm	D6BML55V	cmkajosul000jlxy3kb0a3h6u	\N	ravialfreds@gmail.com	\N	\N	2026-01-12 02:29:48.447	2026-01-12 02:29:48.447
cmkalss9g000vlxy3bgp90gkf	4UKR5TS3	cmkalss8y000rlxy36haub54z	\N	cheunhonho@gmail.com	\N	\N	2026-01-12 03:28:53.525	2026-01-12 03:28:53.525
cmkaysde40007aq27fzekm7yz	KQ38D9EL	cmkaysddf0003aq27krhojpc9	\N	glenn.david.foo@gmail.com	\N	\N	2026-01-12 09:32:29.261	2026-01-12 09:32:29.261
cmkb7k4lr0007wr8sr3b9p1yi	CRQ3PABD	cmkb7k4l50003wr8stem0cwmy	\N	ongchj@gmail.com	\N	\N	2026-01-12 13:38:01.168	2026-01-12 13:38:01.168
cmkc1ct560007kpyky4aoc0ym	KRJXHPXH	cmkc1ct4g0003kpykut5mfad7	\N	mingcheng.lim@gmail.com	\N	\N	2026-01-13 03:32:08.2	2026-01-13 03:32:08.2
cmkc1luo5000fkpykgm410ujp	J7LW7PJX	cmkc1lunh000bkpykzlfsd1gq	\N	livingstonechew@gmail.com	\N	\N	2026-01-13 03:39:10.085	2026-01-13 03:39:10.085
cmkc1luoe000hkpykit4j3zm6	RKLJS7FZ	cmkc1lunh000bkpykzlfsd1gq	\N	livingstonechew@gmail.com	\N	\N	2026-01-13 03:39:10.094	2026-01-13 03:39:10.094
cmkc7pok300087hgn71e55ner	ZU9FXA32	cmkc7poj800047hgnz1a84mm6	\N	admin@acsoba.org	\N	\N	2026-01-13 06:30:06.484	2026-01-13 06:30:06.484
cmkc7pokd000a7hgns8ovdx5j	3B4SH5T2	cmkc7poj800047hgnz1a84mm6	\N	admin@acsoba.org	\N	\N	2026-01-13 06:30:06.493	2026-01-13 06:30:06.493
cmkcao9880007wx2ktm1osbob	VVHA3KF7	cmkcao97g0003wx2k6aryrkpe	\N	yt.low@aes-asia.com	\N	\N	2026-01-13 07:52:58.808	2026-01-13 07:52:58.808
cmkcchxqy000fwx2kkeazri4n	F8KPHQ5D	cmkcchxqd000bwx2kadm9g3ok	\N	jquek@rtnq.com	\N	\N	2026-01-13 08:44:03.226	2026-01-13 08:44:03.226
cmkcchxr6000hwx2k7bx5ma8x	UX6Z2PHP	cmkcchxqd000bwx2kadm9g3ok	\N	jquek@rtnq.com	\N	\N	2026-01-13 08:44:03.235	2026-01-13 08:44:03.235
cmkcchxrb000jwx2kj83yc68x	QX84XJLW	cmkcchxqd000bwx2kadm9g3ok	\N	jquek@rtnq.com	\N	\N	2026-01-13 08:44:03.24	2026-01-13 08:44:03.24
cmkcchxrh000lwx2kcueelh4n	PTFPEQ3M	cmkcchxqd000bwx2kadm9g3ok	\N	jquek@rtnq.com	\N	\N	2026-01-13 08:44:03.245	2026-01-13 08:44:03.245
cmkcchxrm000nwx2kpc1o3cji	L2TZMKFF	cmkcchxqd000bwx2kadm9g3ok	\N	jquek@rtnq.com	\N	\N	2026-01-13 08:44:03.251	2026-01-13 08:44:03.251
cmkcchxrs000pwx2kzyg2wkev	6BCRABNB	cmkcchxqd000bwx2kadm9g3ok	\N	jquek@rtnq.com	\N	\N	2026-01-13 08:44:03.257	2026-01-13 08:44:03.257
cmkcchxrx000rwx2k3o20lc42	R2SLDCE4	cmkcchxqd000bwx2kadm9g3ok	\N	jquek@rtnq.com	\N	\N	2026-01-13 08:44:03.262	2026-01-13 08:44:03.262
cmkcchxs3000twx2k6sqjy2nn	QRU7KFZT	cmkcchxqd000bwx2kadm9g3ok	\N	jquek@rtnq.com	\N	\N	2026-01-13 08:44:03.268	2026-01-13 08:44:03.268
cmkcchxs9000vwx2kem66dmxk	BM6U9GNF	cmkcchxqd000bwx2kadm9g3ok	\N	jquek@rtnq.com	\N	\N	2026-01-13 08:44:03.274	2026-01-13 08:44:03.274
cmkcchxse000xwx2k5rdqco0d	9W69C8MY	cmkcchxqd000bwx2kadm9g3ok	\N	jquek@rtnq.com	\N	\N	2026-01-13 08:44:03.279	2026-01-13 08:44:03.279
cmkcffpsv0007170gykgp5t27	SZMCVLQP	cmkcffpsa0003170g2c6ndobq	\N	suanwee@gmail.com	\N	\N	2026-01-13 10:06:18.463	2026-01-13 10:06:18.463
cmkchfw6h000f170gjhf8lmkl	TRXYPL4T	cmkchfw5r000b170gn7xze5it	\N	chankokyew@gmail.com	\N	\N	2026-01-13 11:02:25.962	2026-01-13 11:02:25.962
cmkchumaw000n170glxubdcuc	S4QSPWPS	cmkchumaa000j170ghqwumsd0	\N	ravialfreds@gmail.com	\N	\N	2026-01-13 11:13:53.001	2026-01-13 11:13:53.001
cmkf4r3a1000714a2uh9e00g4	SSPEVM8L	cmkf4r39d000314a2xvt5th8b	\N	helena.lim@theacsfoundation.org	\N	\N	2026-01-15 07:30:31.897	2026-01-15 07:30:31.897
cmkf4r3aa000914a2ehr524wt	LLT7EABY	cmkf4r39d000314a2xvt5th8b	\N	helena.lim@theacsfoundation.org	\N	\N	2026-01-15 07:30:31.906	2026-01-15 07:30:31.906
cmkglkjlo00079zune2c6ymxy	UQP8LT46	cmkglkjky00039zunxdff9th1	\N	arthurlhlee@gmail.com	\N	\N	2026-01-16 08:09:06.108	2026-01-16 08:09:06.108
cmkzb7dm60007bk78sny27r37	DL56WYLR	cmkzb7dll0003bk78q1l7b6rl	\N	ngoei.wq@gmail.com	\N	\N	2026-01-29 10:26:33.007	2026-01-29 10:26:33.007
cmkm3j4il0008n94g06f8irbp	KVUMK5KU	cmkm3j4ht0004n94gr672c8us	\N	Jayaram_GANGA@schools.gov.sg	\N	\N	2026-01-20 04:30:43.869	2026-01-20 04:30:43.869
cmkm3j4it000an94gwu0q8d93	HLGK2MQB	cmkm3j4ht0004n94gr672c8us	\N	Jayaram_GANGA@schools.gov.sg	\N	\N	2026-01-20 04:30:43.877	2026-01-20 04:30:43.877
cmkm8mjvq00074lkv59194mzo	F9T3CGRR	cmkm8mjv600034lkvajv6r7zu	\N	daniel.chong@aagroup.sg	\N	\N	2026-01-20 06:53:21.83	2026-01-20 06:53:21.83
cmknif3os0007149si5ak5ab6	36R6A84M	cmknif3o50003149ssbkhpddz	\N	domleeky@yahoo.com.sg	\N	\N	2026-01-21 04:15:16.588	2026-01-21 04:15:16.588
cmknif3p00009149s5j3rhfhp	JGCG93JC	cmknif3o50003149ssbkhpddz	\N	domleeky@yahoo.com.sg	\N	\N	2026-01-21 04:15:16.596	2026-01-21 04:15:16.596
cmknif3p4000b149s617ttw0m	N2FAR3RY	cmknif3o50003149ssbkhpddz	\N	domleeky@yahoo.com.sg	\N	\N	2026-01-21 04:15:16.601	2026-01-21 04:15:16.601
cmknvl7ro0007pbfgoq76a0dh	6MXQMA9B	cmknvl7r60003pbfg40vrpwb9	\N	francis@metafusion.com.sg	\N	\N	2026-01-21 10:23:56.821	2026-01-21 10:23:56.821
cmkt8a8my0007kyqae7zslkcw	XAMQRCA7	cmkt8a8me0003kyqail82czm8	\N	ryanthomasjacob@gmail.com	\N	\N	2026-01-25 04:18:10.618	2026-01-25 04:18:10.618
cmkti0mhj0007w69m1oazyh5j	BR2HYEPA	cmkti0mgx0003w69munrvdsej	\N	tyong@redbadgepacific.com	\N	\N	2026-01-25 08:50:38.167	2026-01-25 08:50:38.167
cmktsoy8y0005rvmcquo8qhoh	TQD9XXRQ	cmktsoy8n0003rvmc6qjj7qo2	\N	leonwhy@gmail.com	\N	\N	2026-01-25 13:49:29.315	2026-01-25 13:49:29.315
cmktsoy960007rvmcf3i375lp	QXCDMU6W	cmktsoy8n0003rvmc6qjj7qo2	\N	leonwhy@gmail.com	\N	\N	2026-01-25 13:49:29.322	2026-01-25 13:49:29.322
cmkukjtgs0007l7ioa6fbdjz6	BRQR6JTH	cmkukjtga0003l7ioyzq6lr1j	\N	edmundcktang7@gmail.com	\N	\N	2026-01-26 02:49:19.084	2026-01-26 02:49:19.084
cmkuqxcff000fvs5fxkzw0n7k	WCYWAU4A	cmkuqxcew000bvs5ftqr0wi25	\N	clearroads@gmail.com	\N	\N	2026-01-26 05:47:47.883	2026-01-26 05:47:47.883
cmkuss2e0000713sm8xgzyjsc	TE6GCZVQ	cmkuss2df000313sm5ucqjt60	\N	helena.lim@theacsfoundation.org	\N	\N	2026-01-26 06:39:40.824	2026-01-26 06:39:40.824
cmkuvol960007t2gm9odumd0u	K4XWUK7A	cmkuvol8g0003t2gmqyerw47o	\N	jason@strengthsschool.com	\N	\N	2026-01-26 08:00:57.498	2026-01-26 08:00:57.498
cmkuvol9e0009t2gm2fbvvfh3	ESBYWYWT	cmkuvol8g0003t2gmqyerw47o	\N	jason@strengthsschool.com	\N	\N	2026-01-26 08:00:57.506	2026-01-26 08:00:57.506
cmkvw3kgk000710sdsnhew6uo	XH32SM5T	cmkvw3kg3000310sdi1ahicd1	\N	wai.loke@gmail.com	\N	\N	2026-01-27 01:00:22.485	2026-01-27 01:00:22.485
cmkwnqvjx0008fdy07nm3kdbr	DHKS9A6D	cmkwnqvj30004fdy0f13oc2jn	\N	admin@acsoba.org	\N	\N	2026-01-27 13:54:19.581	2026-01-27 13:54:19.581
cmkwnqvk4000afdy05mm9dsst	YTTEWCGW	cmkwnqvj30004fdy0f13oc2jn	\N	admin@acsoba.org	\N	\N	2026-01-27 13:54:19.588	2026-01-27 13:54:19.588
cmkwnqvk8000cfdy0jzzx632e	R9ETH4E2	cmkwnqvj30004fdy0f13oc2jn	\N	admin@acsoba.org	\N	\N	2026-01-27 13:54:19.593	2026-01-27 13:54:19.593
cmkwns3nw000kfdy01jyx7g3t	R5UE3Q4F	cmkwns3nf000gfdy0c33tagkd	\N	admin@acsoba.org	\N	\N	2026-01-27 13:55:16.748	2026-01-27 13:55:16.748
cmkwns3o1000mfdy01p708a6k	YLUCCD2Q	cmkwns3nf000gfdy0c33tagkd	\N	admin@acsoba.org	\N	\N	2026-01-27 13:55:16.753	2026-01-27 13:55:16.753
cmkwnu8lm000vfdy0uop1bf8z	ZHHUQSAE	cmkwnu8l0000rfdy0dpzibw76	\N	admin@acsoba.org	\N	\N	2026-01-27 13:56:56.458	2026-01-27 13:56:56.458
cmkwnu8ls000xfdy099haoy27	UHB3CU3W	cmkwnu8l0000rfdy0dpzibw76	\N	admin@acsoba.org	\N	\N	2026-01-27 13:56:56.465	2026-01-27 13:56:56.465
cmkwnw3kz0015fdy0y90twado	QYN9L9CQ	cmkwnw3km0011fdy0oh60d8rr	\N	admin@acsoba.org	\N	\N	2026-01-27 13:58:23.267	2026-01-27 13:58:23.267
cmkwnw3l20017fdy0azawwnsp	Y8AY94AC	cmkwnw3km0011fdy0oh60d8rr	\N	admin@acsoba.org	\N	\N	2026-01-27 13:58:23.271	2026-01-27 13:58:23.271
cmkwp6y1o0007wqes8bfvccp5	WAAULFTX	cmkwp6y130003wqesu0simwgy	\N	hengyuwong@yahoo.com.sg	\N	\N	2026-01-27 14:34:48.925	2026-01-27 14:34:48.925
cmkwqn2hc000dwqesxaagbqi9	WPBYMCE4	cmkwqn2h1000bwqese5136o5v	\N	weiyaochan@rocketmail.com	\N	\N	2026-01-27 15:15:20.784	2026-01-27 15:15:20.784
cmkxr56bh0007mh6kbqpmuc9l	TAHDXQK3	cmkxr56al0003mh6kibihu1iw	\N	admin+acsbr@acsoba.org	\N	\N	2026-01-28 08:17:11.742	2026-01-28 08:17:11.742
cmkxr56br0009mh6kcn11grmx	9A92YHBQ	cmkxr56al0003mh6kibihu1iw	\N	admin+acsbr@acsoba.org	\N	\N	2026-01-28 08:17:11.751	2026-01-28 08:17:11.751
cmkxr56bw000bmh6kp2ybfmc0	97NRHZDA	cmkxr56al0003mh6kibihu1iw	\N	admin+acsbr@acsoba.org	\N	\N	2026-01-28 08:17:11.756	2026-01-28 08:17:11.756
cmkz5anya000710z0r3g8tcjs	TFPQ2XF3	cmkz5anxr000310z0wew8w2io	\N	arthurlhlee@gmail.com	\N	\N	2026-01-29 07:41:08.674	2026-01-29 07:41:08.674
cmkz74ldv00075yv7qy3uxu31	WRL2QY5E	cmkz74ld600035yv7gx3l1m97	\N	JKHOOSAN@GMAIL.COM	\N	\N	2026-01-29 08:32:24.643	2026-01-29 08:32:24.643
\.


--

COPY public.tables (id, "tableNumber", capacity, status, "tableHash", x, y, "bookingId", "createdAt", "updatedAt") FROM stdin;
table-01	T01	10	AVAILABLE	hash-1	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-02	T02	10	AVAILABLE	hash-2	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-03	T03	10	AVAILABLE	hash-3	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-04	T04	10	AVAILABLE	hash-4	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-05	T05	10	AVAILABLE	hash-5	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-06	T06	10	AVAILABLE	hash-6	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-07	T07	10	AVAILABLE	hash-7	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-08	T08	10	AVAILABLE	hash-8	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-09	T09	10	AVAILABLE	hash-9	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-10	T10	10	AVAILABLE	hash-10	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-11	T11	10	AVAILABLE	hash-11	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-12	T12	10	AVAILABLE	hash-12	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-13	T13	10	AVAILABLE	hash-13	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-14	T14	10	AVAILABLE	hash-14	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-15	T15	10	AVAILABLE	hash-15	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-16	T16	10	AVAILABLE	hash-16	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-17	T17	10	AVAILABLE	hash-17	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-18	T18	10	AVAILABLE	hash-18	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-19	T19	10	AVAILABLE	hash-19	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-20	T20	10	AVAILABLE	hash-20	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-21	T21	10	AVAILABLE	hash-21	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-22	T22	10	AVAILABLE	hash-22	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-23	T23	10	AVAILABLE	hash-23	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-24	T24	10	AVAILABLE	hash-24	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-25	T25	10	AVAILABLE	hash-25	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-26	T26	10	AVAILABLE	hash-26	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-27	T27	10	AVAILABLE	hash-27	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-28	T28	10	AVAILABLE	hash-28	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-29	T29	10	AVAILABLE	hash-29	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-30	T30	10	AVAILABLE	hash-30	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-31	T31	10	AVAILABLE	hash-31	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-32	T32	10	AVAILABLE	hash-32	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-33	T33	10	AVAILABLE	hash-33	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-34	T34	10	AVAILABLE	hash-34	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-35	T35	10	AVAILABLE	hash-35	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-36	T36	10	AVAILABLE	hash-36	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-37	T37	10	AVAILABLE	hash-37	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-38	T38	10	AVAILABLE	hash-38	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-39	T39	10	AVAILABLE	hash-39	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-40	T40	10	AVAILABLE	hash-40	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-41	T41	10	AVAILABLE	hash-41	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-42	T42	10	AVAILABLE	hash-42	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-43	T43	10	AVAILABLE	hash-43	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-44	T44	10	AVAILABLE	hash-44	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-45	T45	10	AVAILABLE	hash-45	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-46	T46	10	AVAILABLE	hash-46	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-47	T47	10	AVAILABLE	hash-47	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-48	T48	10	AVAILABLE	hash-48	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-49	T49	10	AVAILABLE	hash-49	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-50	T50	10	AVAILABLE	hash-50	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-51	T51	10	AVAILABLE	hash-51	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-52	T52	10	AVAILABLE	hash-52	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-53	T53	10	AVAILABLE	hash-53	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-54	T54	10	AVAILABLE	hash-54	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-55	T55	10	AVAILABLE	hash-55	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-56	T56	10	AVAILABLE	hash-56	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-57	T57	10	AVAILABLE	hash-57	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-58	T58	10	AVAILABLE	hash-58	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-59	T59	10	AVAILABLE	hash-59	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-60	T60	10	AVAILABLE	hash-60	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-61	T61	10	AVAILABLE	hash-61	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-62	T62	10	AVAILABLE	hash-62	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-63	T63	10	AVAILABLE	hash-63	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-64	T64	10	AVAILABLE	hash-64	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-65	T65	10	AVAILABLE	hash-65	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-66	T66	10	AVAILABLE	hash-66	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-67	T67	10	AVAILABLE	hash-67	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-68	T68	10	AVAILABLE	hash-68	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-69	T69	10	AVAILABLE	hash-69	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-70	T70	10	AVAILABLE	hash-70	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-71	T71	10	AVAILABLE	hash-71	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-72	T72	10	AVAILABLE	hash-72	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-73	T73	10	AVAILABLE	hash-73	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-74	T74	10	AVAILABLE	hash-74	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-75	T75	10	AVAILABLE	hash-75	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-76	T76	10	AVAILABLE	hash-76	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-77	T77	10	AVAILABLE	hash-77	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-78	T78	10	AVAILABLE	hash-78	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-79	T79	10	AVAILABLE	hash-79	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-80	T80	10	AVAILABLE	hash-80	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-81	T81	10	AVAILABLE	hash-81	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-82	T82	10	AVAILABLE	hash-82	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-83	T83	10	AVAILABLE	hash-83	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-84	T84	10	AVAILABLE	hash-84	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-85	T85	10	AVAILABLE	hash-85	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-86	T86	10	AVAILABLE	hash-86	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-87	T87	10	AVAILABLE	hash-87	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-88	T88	10	AVAILABLE	hash-88	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-89	T89	10	AVAILABLE	hash-89	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-90	T90	10	AVAILABLE	hash-90	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-91	T91	10	AVAILABLE	hash-91	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
table-92	T92	10	AVAILABLE	hash-92	\N	\N	\N	2026-01-09 08:34:04.182	2026-01-09 08:34:04.182
cmk7xchbk000tui2bws6cxkj8	TEMP-cmk7xchb	10	RESERVED	1d7f655e9b	\N	\N	cmk7xchb8000rui2bqf9hcvnz	2026-01-10 06:28:49.712	2026-01-10 06:28:49.712
cmk7xumwm0011ui2bg0b7vsb4	TEMP-cmk7xumw	10	RESERVED	f29a816f0a	\N	\N	cmk7xumw3000zui2bhuz6xq02	2026-01-10 06:42:56.758	2026-01-10 06:42:56.758
cmk7xuqxh0019ui2bzcft3i84	TEMP-cmk7xuqx	10	RESERVED	508fb85091	\N	\N	cmk7xuqx70017ui2bshy7dxvf	2026-01-10 06:43:01.973	2026-01-10 06:43:01.973
cmk7y0fb4001hui2bk27lh3c6	TEMP-cmk7y0fa	10	RESERVED	adcf9cfde5	\N	\N	cmk7y0fav001fui2bug20xq6m	2026-01-10 06:47:26.848	2026-01-10 06:47:26.848
cmk7y2qwh001pui2bo4rdz0sd	TEMP-cmk7y2qv	10	RESERVED	725ceeb9ca	\N	\N	cmk7y2qvu001nui2b2qd6hg6u	2026-01-10 06:49:15.185	2026-01-10 06:49:15.185
cmk7ychs4001xui2b7lf8sojn	TEMP-cmk7ychr	10	RESERVED	4235dc70c8	\N	\N	cmk7ychrr001vui2bxjk501sx	2026-01-10 06:56:49.925	2026-01-10 06:56:49.925
cmk7z7jat003fui2bx6az7rso	TEMP-cmk7z7ja	10	RESERVED	5a2ab5a04d	\N	\N	cmk7z7jai003dui2bcjaxr4cx	2026-01-10 07:20:58.23	2026-01-10 07:20:58.23
cmk7z7qkz003pui2bxe60yz8e	TEMP-cmk7z7qk	10	RESERVED	b0d68062de	\N	\N	cmk7z7qkp003nui2b8p87g23m	2026-01-10 07:21:07.667	2026-01-10 07:21:07.667
cmk7zf479003xui2bmb08sypa	TEMP-cmk7zf46	10	RESERVED	09929e13f5	\N	\N	cmk7zf46y003vui2bi3au5lv9	2026-01-10 07:26:51.909	2026-01-10 07:26:51.909
cmk80sg9w0051ui2b3xm1ukvn	TEMP-cmk80sg9	10	RESERVED	7d82d1a8bc	\N	\N	cmk80sg9p004zui2bnky03p0a	2026-01-10 08:05:13.701	2026-01-10 08:05:13.701
cmk81cxn1005hui2by53r23ob	TEMP-cmk81cxm	10	RESERVED	0896ceb870	\N	\N	cmk81cxmq005fui2bhvf8yk3d	2026-01-10 08:21:09.325	2026-01-10 08:21:09.325
cmk81wsl6005pui2bnnvm3j7r	TEMP-cmk81wsk	10	RESERVED	01cbc95d3a	\N	\N	cmk81wskv005nui2b0kv6d9f3	2026-01-10 08:36:35.899	2026-01-10 08:36:35.899
cmk82ap1a005xui2bm6nbhdog	TEMP-cmk82ap0	10	RESERVED	58c781f4c0	\N	\N	cmk82ap0u005vui2bhgiqlwb8	2026-01-10 08:47:24.478	2026-01-10 08:47:24.478
cmk866jdl0065ui2bymf2ahqw	TEMP-cmk866jd	10	RESERVED	55b4299baa	\N	\N	cmk866jd90063ui2b0j30o721	2026-01-10 10:36:08.985	2026-01-10 10:36:08.985
cmk8fwzni000d10sifrpuu8bz	TEMP-cmk8fwzn	10	RESERVED	178e2a4810	\N	\N	cmk8fwzn9000b10sijgg4edxx	2026-01-10 15:08:39.678	2026-01-10 15:08:39.678
cmk8xrdyz0005dycs764y744x	TEMP-cmk8xrdy	10	RESERVED	a11ab3bb54	\N	\N	cmk8xrdyl0003dycscmgqdluw	2026-01-10 23:28:11.387	2026-01-10 23:28:11.387
cmk9294d8000ldycshv3vpxns	TEMP-cmk9294c	10	RESERVED	8ac57233ac	\N	\N	cmk9294cu000jdycs6v2st1xu	2026-01-11 01:33:57.213	2026-01-11 01:33:57.213
cmk92lhqv000tdycsks9ob71e	TEMP-cmk92lhq	10	RESERVED	fdc06ea8e8	\N	\N	cmk92lhqh000rdycso3pr1e6x	2026-01-11 01:43:34.423	2026-01-11 01:43:34.423
cmk97r7cz0005i0nsj7q3ab71	TEMP-cmk97r7c	10	RESERVED	9c0606c8ef	\N	\N	cmk97r7cn0003i0ns55zvrewo	2026-01-11 04:07:58.979	2026-01-11 04:07:58.979
cmk9a6se6000fi0nslss9dl1i	TEMP-cmk9a6sd	10	RESERVED	cb88cad09a	\N	\N	cmk9a6sdu000di0nshcl9wma5	2026-01-11 05:16:05.311	2026-01-11 05:16:05.311
cmk9bh02w000ni0nsmwnkh3ac	TEMP-cmk9bh02	10	RESERVED	a41a519399	\N	\N	cmk9bh02m000li0nshx7ei753	2026-01-11 05:52:01.448	2026-01-11 05:52:01.448
cmkaimg2k0005lxy3vlbpux6m	TEMP-cmkaimg2	10	RESERVED	aa67788ec1	\N	\N	cmkaimg270003lxy3fkj45p1j	2026-01-12 01:59:58.94	2026-01-12 01:59:58.94
cmkajl9xx000dlxy37cok8i1c	TEMP-cmkajl9x	10	RESERVED	fd7f58e5d8	\N	\N	cmkajl9xm000blxy3wfvp4q1y	2026-01-12 02:27:03.958	2026-01-12 02:27:03.958
cmkajosux000llxy3z6jrvac4	TEMP-cmkajosu	10	RESERVED	74c6a0004f	\N	\N	cmkajosul000jlxy3kb0a3h6u	2026-01-12 02:29:48.44	2026-01-12 02:29:48.44
cmkalss99000tlxy3s0cm0vqi	TEMP-cmkalss8	10	RESERVED	fdca4c4b76	\N	\N	cmkalss8y000rlxy36haub54z	2026-01-12 03:28:53.517	2026-01-12 03:28:53.517
cmkaysddu0005aq27i025dppl	TEMP-cmkaysdd	10	RESERVED	f8d4e0d015	\N	\N	cmkaysddf0003aq27krhojpc9	2026-01-12 09:32:29.25	2026-01-12 09:32:29.25
cmkb7k4lh0005wr8s4p91jkoe	TEMP-cmkb7k4l	10	RESERVED	41b4e802f8	\N	\N	cmkb7k4l50003wr8stem0cwmy	2026-01-12 13:38:01.157	2026-01-12 13:38:01.157
cmkc1ct4v0005kpyk0ep439v9	TEMP-cmkc1ct4	10	RESERVED	464341247a	\N	\N	cmkc1ct4g0003kpykut5mfad7	2026-01-13 03:32:08.191	2026-01-13 03:32:08.191
cmkc1lunv000dkpykdsnue4ii	TEMP-cmkc1lun	10	RESERVED	5d43a98cde	\N	\N	cmkc1lunh000bkpykzlfsd1gq	2026-01-13 03:39:10.076	2026-01-13 03:39:10.076
cmkc7poju00067hgn59lsgj3r	TEMP-cmkc7poj	10	RESERVED	a7ab88b599	\N	\N	cmkc7poj800047hgnz1a84mm6	2026-01-13 06:30:06.474	2026-01-13 06:30:06.474
cmkcao97w0005wx2kuoasubvw	TEMP-cmkcao97	10	RESERVED	31f8f9b948	\N	\N	cmkcao97g0003wx2k6aryrkpe	2026-01-13 07:52:58.797	2026-01-13 07:52:58.797
cmkcchxqp000dwx2krej0ttqx	TEMP-cmkcchxq	10	RESERVED	cf7d69f257	\N	\N	cmkcchxqd000bwx2kadm9g3ok	2026-01-13 08:44:03.217	2026-01-13 08:44:03.217
cmkcffpsm0005170goq90frzz	TEMP-cmkcffps	10	RESERVED	6cf662b8c3	\N	\N	cmkcffpsa0003170g2c6ndobq	2026-01-13 10:06:18.454	2026-01-13 10:06:18.454
cmkchfw67000d170gxu1ny426	TEMP-cmkchfw5	10	RESERVED	4fe89a3cbb	\N	\N	cmkchfw5r000b170gn7xze5it	2026-01-13 11:02:25.951	2026-01-13 11:02:25.951
cmkchuman000l170gznh75qpi	TEMP-cmkchuma	10	RESERVED	34d785429a	\N	\N	cmkchumaa000j170ghqwumsd0	2026-01-13 11:13:52.991	2026-01-13 11:13:52.991
cmkf4r39q000514a2n8h7qw2b	TEMP-cmkf4r39	10	RESERVED	79985ecae3	\N	\N	cmkf4r39d000314a2xvt5th8b	2026-01-15 07:30:31.886	2026-01-15 07:30:31.886
cmkglkjle00059zunoboiyajz	TEMP-cmkglkjk	10	RESERVED	2ea0026c01	\N	\N	cmkglkjky00039zunxdff9th1	2026-01-16 08:09:06.098	2026-01-16 08:09:06.098
cmkm3j4ib0006n94gbw86vcyf	TEMP-cmkm3j4h	10	RESERVED	569d7be177	\N	\N	cmkm3j4ht0004n94gr672c8us	2026-01-20 04:30:43.859	2026-01-20 04:30:43.859
cmkm8mjvh00054lkvskgc87f7	TEMP-cmkm8mjv	10	RESERVED	bccf86da00	\N	\N	cmkm8mjv600034lkvajv6r7zu	2026-01-20 06:53:21.821	2026-01-20 06:53:21.821
cmknif3oi0005149sw5upj6hd	TEMP-cmknif3o	10	RESERVED	0aa749fa2e	\N	\N	cmknif3o50003149ssbkhpddz	2026-01-21 04:15:16.578	2026-01-21 04:15:16.578
cmknvl7rh0005pbfgzs9eu27l	TEMP-cmknvl7r	10	RESERVED	5d2fc0ad7c	\N	\N	cmknvl7r60003pbfg40vrpwb9	2026-01-21 10:23:56.813	2026-01-21 10:23:56.813
cmkt8a8mp0005kyqao9za5qvx	TEMP-cmkt8a8m	10	RESERVED	99c2b911ae	\N	\N	cmkt8a8me0003kyqail82czm8	2026-01-25 04:18:10.609	2026-01-25 04:18:10.609
cmkti0mh90005w69mo7m7q9eq	TEMP-cmkti0mg	10	RESERVED	02a79d9932	\N	\N	cmkti0mgx0003w69munrvdsej	2026-01-25 08:50:38.157	2026-01-25 08:50:38.157
cmkukjtgk0005l7ioktudw9jf	TEMP-cmkukjtg	10	RESERVED	f0748c182c	\N	\N	cmkukjtga0003l7ioyzq6lr1j	2026-01-26 02:49:19.076	2026-01-26 02:49:19.076
cmkuj5xfu0006rrv66ezjyote	TEMP-cmkuj5xf	10	RESERVED	d7b5170b4a	\N	\N	\N	2026-01-26 02:10:31.434	2026-01-26 02:10:31.434
cmkuqxcf7000dvs5fsff19zlc	TEMP-cmkuqxce	10	RESERVED	691c373c46	\N	\N	cmkuqxcew000bvs5ftqr0wi25	2026-01-26 05:47:47.876	2026-01-26 05:47:47.876
cmkuss2dr000513smmym33ch7	TEMP-cmkuss2d	10	RESERVED	fa629d941d	\N	\N	cmkuss2df000313sm5ucqjt60	2026-01-26 06:39:40.815	2026-01-26 06:39:40.815
cmkuvol8t0005t2gmxli13egx	TEMP-cmkuvol8	10	RESERVED	1074cb20ee	\N	\N	cmkuvol8g0003t2gmqyerw47o	2026-01-26 08:00:57.486	2026-01-26 08:00:57.486
cmkvw3kgd000510sdeubbi83k	TEMP-cmkvw3kg	10	RESERVED	2d7587f049	\N	\N	cmkvw3kg3000310sdi1ahicd1	2026-01-27 01:00:22.477	2026-01-27 01:00:22.477
cmkwnqvjn0006fdy0mieu9mh4	TEMP-cmkwnqvj	10	RESERVED	a4f322b433	\N	\N	cmkwnqvj30004fdy0f13oc2jn	2026-01-27 13:54:19.571	2026-01-27 13:54:19.571
cmkwns3nr000ifdy0e3iidpht	TEMP-cmkwns3n	10	RESERVED	6bb8bf5966	\N	\N	cmkwns3nf000gfdy0c33tagkd	2026-01-27 13:55:16.744	2026-01-27 13:55:16.744
cmkwnu8lf000tfdy08ph079mc	TEMP-cmkwnu8l	10	RESERVED	c36e298a49	\N	\N	cmkwnu8l0000rfdy0dpzibw76	2026-01-27 13:56:56.452	2026-01-27 13:56:56.452
cmkwnw3kv0013fdy0swhlba9l	TEMP-cmkwnw3k	10	RESERVED	84c22e413b	\N	\N	cmkwnw3km0011fdy0oh60d8rr	2026-01-27 13:58:23.263	2026-01-27 13:58:23.263
cmkwp6y1g0005wqes1z4wvrf1	TEMP-cmkwp6y1	10	RESERVED	038eadd609	\N	\N	cmkwp6y130003wqesu0simwgy	2026-01-27 14:34:48.916	2026-01-27 14:34:48.916
cmkxr56b90005mh6kxbf09wvy	TEMP-cmkxr56a	10	RESERVED	af373373af	\N	\N	cmkxr56al0003mh6kibihu1iw	2026-01-28 08:17:11.733	2026-01-28 08:17:11.733
cmkz5any2000510z0q3fdoa7x	TEMP-cmkz5anx	10	RESERVED	6c022ed5a2	\N	\N	cmkz5anxr000310z0wew8w2io	2026-01-29 07:41:08.666	2026-01-29 07:41:08.666
cmkz74ldk00055yv7efb0neqo	TEMP-cmkz74ld	10	RESERVED	ddacacf3d6	\N	\N	cmkz74ld600035yv7gx3l1m97	2026-01-29 08:32:24.632	2026-01-29 08:32:24.632
cmkzb7dly0005bk788n0faw4m	TEMP-cmkzb7dl	10	RESERVED	62bb54534d	\N	\N	cmkzb7dll0003bk78q1l7b6rl	2026-01-29 10:26:32.998	2026-01-29 10:26:32.998
cml2bl7iv0005nb573sgsu7as	TEMP-cml2bl7i	10	RESERVED	ba1aa9ee39	\N	\N	cml2bl7ij0003nb57rnt8mtbe	2026-01-31 13:00:36.823	2026-01-31 13:00:36.823
\.


--

COPY public."_BookingGuests" ("A", "B") FROM stdin;
\.


COPY public.email_logs (id, "to", subject, type, "sentAt", status, error) FROM stdin;
\.


