<?php
date_default_timezone_set('America/Buenos_Aires');

include('exceptionhandler.php');
include('wsaa.class.php');
include('wsfev1.class.php');

$wsaa = new WSAA();

// Compruebo fecha de exp y si la excede genero nuevo TA
$fecha_ahora = date("Y-m-d H-i-s");
$fecha_exp_TA = $wsaa->get_expiration();

if ($fecha_exp_TA < $fecha_ahora) {
	if ($wsaa->generar_TA()) {                                                                                                                                                        
    // echo 'Nuevo TA, válido hasta: '. $wsaa->get_expiration() .'<br>';                                                                                                                                                   
  } else {
	echo	'{
		"status":"err",
		"message":"Error al obtener TA",
	}';
  }
} else {
	//  echo 'TA reutilizado, válido hasta: '. $wsaa->get_expiration() .'<br>'; 
}

//Conecto Wsfev1

$wsfev1 = new WSFEV1();

$config = json_decode($_POST['config'], true);

$fp = fopen("myarchivo.txt","a");
fwrite($fp, $config . PHP_EOL);
fclose($fp);  

$CUIT = $config["companyCUIT"];
$CUIT = explode("-", $CUIT)[0].explode("-", $CUIT)[1].explode("-", $CUIT)[2];

$wsfev1->setConfig($CUIT, "1");

// Carga el archivo TA.xml
$wsfev1->openTA();

$data = json_decode($_POST['transaction'], true);
$fp = fopen("myarchivo2.txt","a");
fwrite($fp, $data . PHP_EOL);
fclose($fp);  

$doctipo;
$docnumber;

if( $data["company"]["CUIT"] == '' ) {
	$doctipo = 96;
	$docnumber = (double) $data["company"]["DNI"];
} else {
	$doctipo = 80;
	$CUIT = explode("-", $data["company"]["CUIT"])[0].explode("-", $data["company"]["CUIT"])[1].explode("-", $data["company"]["CUIT"])[2];
	$docnumber = (double) $CUIT;
}

$tipcomp;
$x;

for ( $x = 0 ; $x < count($data["type"]["codes"]) ; $x ++ ) {
	if ($data["type"]["codes"][$x]["letter"] == $data["letter"]) {
		$tipcomp = $data["type"]["codes"][$x]["code"];
	}
}

$impneto;
$impiva;

for ( $y = 0 ; $y < count($data["taxes"]) ; $y ++) {
	$impneto = $impneto + $data["taxes"][$y]["taxBase"];
	$impiva = $impiva + $data["taxes"][$y]["taxAmount"];
}
//13/02/2018 04:40:38
$ptovta = $data["origin"]; //Punto de Venta SIN CEROS ADELANTE!!
$tipocbte = $tipcomp; // Factura A: 1 --- Factura B: 6 ---- Factura C: 11
$cbteFecha = explode(" ",explode("/", $data["startDate"])[2])[0].explode("/", $data["startDate"])[1].explode("/", $data["startDate"])[0];

$regfe['CbteTipo']=$tipocbte;
$regfe['Concepto']=1; //Productos: 1 ---- Servicios: 2 ---- Prod y Serv: 3
$regfe['DocTipo']= $doctipo; //80=CUIT -- 96 DNI --- 99 general cons final
$regfe['DocNro']= $docnumber;  //0 para consumidor final / importe menor a $1000
$regfe['CbteFch']=$cbteFecha; 	// fecha emision de factura
$regfe['ImpNeto']= $impneto;			// Imp Neto
$regfe['ImpTotConc']=0;			// no gravado
$regfe['ImpIVA']= $impiva;			// IVA liquidado
$regfe['ImpTrib']=0;			// otros tributos
$regfe['ImpOpEx']=0;			// operacion exentas
$regfe['ImpTotal']=$data["totalPrice"];			// total de la factura. ImpNeto + ImpTotConc + ImpIVA + ImpTrib + ImpOpEx
$regfe['FchServDesde']=null;	// solo concepto 2 o 3
$regfe['FchServHasta']=null;	// solo concepto 2 o 3
$regfe['FchVtoPago']=null;		// solo concepto 2 o 3
$regfe['MonId']='PES'; 			// Id de moneda 'PES'
$regfe['MonCotiz']=1;			// Cotizacion moneda. Solo exportacion

// Comprobantes asociados (solo notas de crédito y débito):
$regfeasoc['Tipo'] = 91; //91; //tipo 91|5			
$regfeasoc['PtoVta'] = 1;
$regfeasoc['Nro'] = 1;

// Detalle de otros tributos
$regfetrib['Id'] = 1; 			
$regfetrib['Desc'] = '';
$regfetrib['BaseImp'] = 0;
$regfetrib['Alic'] = 0; 
$regfetrib['Importe'] = 0;


// Detalle de iva

$z;
$baseimp;
$impor;

for ( $z = 0 ; $z < count($data["taxes"]) ; $z ++) {
	$baseimp = $baseimp + $data["taxes"][$y]["percentage"];
	$impor = $impgrav + $data["taxes"][$y]["taxAmount"];
}

$regfeiva['Id'] = 5; 
$regfeiva['BaseImp'] = $impneto; 
$regfeiva['Importe'] = $impiva;

//Pido ultimo numero autorizado
$nro = $wsfev1->FECompUltimoAutorizado($ptovta, $tipocbte);

if(!is_numeric($nro)) {
	$nro=0;
	$nro1 = 0;
	echo	'{
		"status":"err",
		"code":'.$wsfev1->Code.',
		"message":"'.$wsfev1->Msg.'",
		"observationCode":"'.$wsfev1->ObsCod.'",
		"observationMessage":"'.$wsfev1->ObsMsg.'"
	}';	
} else {

	// echo "<br>FECompUltimoAutorizado: $nro <br>"; // no es necesario
	$nro1 = $nro + 1;
	// echo "ptovta";
	// var_dump($ptovta);
	// echo "regfe";
	// var_dump($regfe);
	// echo "regfeasoc";
	// var_dump($regfeasoc);
	// echo "regfetrib";
	// var_dump($regfetrib);
	// echo "regfeiva";
	// var_dump($regfeiva);
	$cae = $wsfev1->FECAESolicitar($nro1, // ultimo numero de comprobante autorizado mas uno 
                $ptovta,  // el punto de venta
                $regfe, // los datos a facturar
				$regfeasoc,
				$regfetrib,
				$regfeiva	
	 );
	 
	$caenum = $cae['cae']; 
	$caefvt = $cae['fecha_vencimiento'];
	$numero = $nro+1;    
	
	if ($caenum != "") {
	
		$CAEExpirationDate = str_split($caefvt, 2)[3]."/".str_split($caefvt, 2)[2]."/".str_split($caefvt, 4)[0]." 00:00:00";
	
		echo	'{
			"status":"OK",
			"number":'.$numero.',
			"CAE":"'.$caenum.'",
			"CAEExpirationDate":"'.$CAEExpirationDate.'"
		}';

	} else {
		echo	'{
			"status":"err",
			"code":'.$wsfev1->Code.',
			"message":"'.$wsfev1->Msg.'",
			"observationCode":"'.$wsfev1->ObsCod.'",
			"observationMessage":"'.$wsfev1->ObsMsg.'",
			"observationCode2":"'.$wsfev1->ObsCode2.'",
			"observationMessage2":"'.$wsfev1->ObsMsg2.'"
		}';
	}
}