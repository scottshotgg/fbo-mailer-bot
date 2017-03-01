<html>
	<body>
		<?php
			// connect and login to FTP server
			$ftp_server = "localhost";
			$ftp_conn = ftp_connect($ftp_server) or die("Could not connect to $ftp_server");
			$login = ftp_login($ftp_conn, 'anonymous', '') or die("Could not login to $ftp_server");

			$local_file = "/tmp/file.csv";
			$server_file = "file.csv";
			ftp_pasv($ftp_conn, TRUE) or die("dun fked up m8");

			echo join('<br>', ftp_rawlist($ftp_conn, "/fboscraper"));
			echo '<br><br>';

			// download server file
			if (ftp_get($ftp_conn, $local_file, $server_file, FTP_ASCII)) {
				echo "Successfully written to $local_file.";
			} else {
				echo "Error downloading $server_file.";
			}

			// close connection
			ftp_close($ftp_conn);
		?>
	</body>
</html>