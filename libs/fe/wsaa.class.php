<?php

class WSAA {

	//Definir tipo de uso
	private $OS = "window"; // O linux
	private $build = "test"; // O prod

	const P_CERT = "keys/poscloud_49ef44bde97bbdd9.crt";        	//Certificado AFIP
	const T_CERT = "keys/poscloud.crt";
	const PRIVATEKEY = "keys/poscloud.key";  	//Clave privada con la que se genero el requerimiento de cerificado
	const PASSPHRASE = "";
	const PROXY_ENABLE = false;
	const T_URL = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms"; // homologacion (testing)
	const P_URL = "https://wsaa.afip.gov.ar/ws/services/LoginCms"; // produccion
	
	const TA 	= "xml/TA.xml";        			# Ticket de Acceso
	const T_WSDL 	= "wsaa.wsdl";      			//testing / homologacion
	const P_WSDL = "https://wsaa.afip.gov.ar/ws/services/LoginCms?WSDL"; //produccion
  
	//Path completo
	const PATH_LINUX = 'C:/AfipML INSCRIPTOS/';
	const PATH_WINDOW = 'C:/PosCloud/xampp/htdocs/libs/fe/';

	private $URL;
	private $WSDL;
	private $path;
	private $cert;

	/*
	* manejo de errores
	*/
	public $error = '';

	//Cliente SOAP
	private $client;
	
	private $service; 
  
  	public function __construct($service = 'wsfe') 
	{
		$this->service = $service;    

		if($this->build === "test") {
			$this->WSDL = self::T_WSDL;
			$this->URL = self::T_URL;
			$this->cert = self::T_CERT;
		} else {
			$this->WSDL = self::P_WSDL;
			$this->URL = self::P_URL;
			$this->cert = self::P_CERT;
		}
		
		if($this->OS === "window") {
			$this->path = self::PATH_WINDOW;
		} else {
			$this->path = self::PATH_LINUX;
		}
		
		// seteos en php
		ini_set("soap.wsdl_cache_enabled", "0");    
		
		// validar archivos necesarios
		if (!file_exists($this->path.$this->cert)) $this->error .= " Failed to open ".$this->cert;
		if (!file_exists($this->path.self::PRIVATEKEY)) $this->error .= " Failed to open ".self::PRIVATEKEY;
		if($this->build === "test") {
			if (!file_exists($this->path.$this->WSDL)) $this->error .= " Failed to open ".$this->WSDL;
		}
		
		if(!empty($this->error)) {
			$result ='{
						"status":"err",
						"message":"WSAA class. Faltan archivos necesarios para el funcionamiento"
					}';
			file_put_contents("log.txt", date("d/m/Y h:i:s") ." - WSAA Err: ". $result."\n", FILE_APPEND | LOCK_EX);
			echo $result;
		}
		
		$options = array(
					'soap_version'   => SOAP_1_2,
					'location'       => $this->URL,
					'trace'          => 1,
					'exceptions'     => 0
				);

		file_put_contents("log.txt", date("d/m/Y h:i:s") ." - WSAA Options SoapClient: ".json_encode($options)."\n", FILE_APPEND | LOCK_EX);
		$this->client = new SoapClient($this->WSDL, $options);
	}
  
	/*
	* Crea el archivo xml de TRA
	*/
	private function create_TRA()
	{
		$TRA = new SimpleXMLElement(
				'<?xml version="1.0" encoding="UTF-8"?>' .
				'<loginTicketRequest version="1.0">'.
				'</loginTicketRequest>');
		$TRA->addChild('header');
		$TRA->header->addChild('uniqueId', date('U'));
		$TRA->header->addChild('generationTime', date('c',date('U')-60));
		$TRA->header->addChild('expirationTime', date('c',date('U')+60));
		$TRA->addChild('service', $this->service);
		$TRA->asXML($this->path.'xml/TRA.xml');
	}
  
	/*
	* This functions makes the PKCS#7 signature using TRA as input file, CERT and
	* PRIVATEKEY to sign. Generates an intermediate file and finally trims the 
	* MIME heading leaving the final CMS required by WSAA.
	* 
	* devuelve el CMS
	*/
	private function sign_TRA()
	{
		$STATUS = openssl_pkcs7_sign($this->path . "xml/TRA.xml", $this->path . "xml/TRA.tmp", "file://" . $this->path.$this->cert,
			array("file://" . $this->path.self::PRIVATEKEY, self::PASSPHRASE),
			array(),
			!PKCS7_DETACHED
		);
		
		if (!$STATUS) {
			$result ='{
						"status":"err",
						"message":"ERROR generating PKCS#7 signature"
					}';
			file_put_contents("log.txt", date("d/m/Y h:i:s") ." - WSAA Err: ". $result."\n", FILE_APPEND | LOCK_EX);
			echo $result;
		}
			
		$inf = fopen($this->path."xml/TRA.tmp", "r");
		$i = 0;
		$CMS = "";
		while (!feof($inf)) { 
			$buffer = fgets($inf);
			if ( $i++ >= 4 ) $CMS .= $buffer;
		}
		
		fclose($inf);
		unlink($this->path."xml/TRA.tmp");
		
		return $CMS;
	}
  
	//Obtengo token y Sign

	private function call_WSAA($cms)
	{
		$results = $this->client->loginCms(array('in0' => $cms));

		// para logueo
		file_put_contents($this->path."request-loginCms.xml", $this->client->__getLastRequest()."\n", FILE_APPEND | LOCK_EX);
		file_put_contents($this->path."response-loginCms.xml", $this->client->__getLastResponse()."\n", FILE_APPEND | LOCK_EX);

		if (is_soap_fault($results)) {
			$result ='{
						"status":"err",
						"message":"SOAP Fault: '.$results->faultcode.': '.$results->faultstring.'"
					}';
			file_put_contents("log.txt", date("d/m/Y h:i:s") ." - WSAA Err: ". $result."\n", FILE_APPEND | LOCK_EX);
			echo $result;
		}

		return $results->loginCmsReturn;
	}
  
	// Array a XML
	private function xml2array($xml) 
	{    
		$json = json_encode( simplexml_load_string($xml));
		return json_decode($json, TRUE);
	}    
  
	//Genero TA
	public function generar_TA()
	{
		$this->create_TRA();
		$TA = $this->call_WSAA( $this->sign_TRA() );
						
		if (!file_put_contents($this->path.self::TA, $TA)) {
			$result ='{
						"status":"err",
						"message":"Error al generar al archivo TA.xml"
					}';
			file_put_contents("log.txt", date("d/m/Y h:i:s") ." - WSAA Err: ". $result."\n", FILE_APPEND | LOCK_EX);
			echo $result;
		}

		$this->TA = $this->xml2Array($TA);
		
		return true;
	}
  
	//Expiracion del Tiket de Acceso TA
	public function get_expiration() 
	{    
		// si no esta en memoria abrirlo
		if(empty($this->TA)) {
			$TA_file = file($this->path.self::TA, FILE_IGNORE_NEW_LINES);
			if($TA_file) {
				$TA_xml = '';
				for($i=0; $i < sizeof($TA_file); $i++)
					$TA_xml.= $TA_file[$i];        
				$this->TA = $this->xml2Array($TA_xml);
				$r = $this->TA['header']['expirationTime'];
			} else {
				$r = false;
			}
		} else {
			$r = $this->TA['header']['expirationTime'];
		}
		$r = str_replace("T"," ",substr($this->TA['header']['expirationTime'],0,19)); 
		return $r;
	}
}
?>
