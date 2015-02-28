<?php
error_reporting(E_ALL ^ E_NOTICE);

require 'config.php';

if($_REQUEST["action_like_works"]==1){
	$cookies = explode(',',($_COOKIE["ls"]?$_COOKIE["ls"]:''));
	if(!array_search($_REQUEST["wid"],$cookies)){

		$host = $config["db_host"];
		$user = $config["db_user"];
		$pass = $config["db_pass"];


		$db_name = "fi_db";

		$dbh = new PDO("mysql:host=$host;dbname=$db_name", $user, $pass);
		$dbh->exec("SET NAMES utf8");
		$dbh->exec("SET time_zone = '+2:00'");

		$q = $dbh->prepare('update works set `likes` = `likes` + 1 where id = :id');
		$q->execute(array(
			":id" => $_REQUEST["wid"]
		));

		setcookie("ls",($_COOKIE["ls"]?$_COOKIE["ls"]:'').$_REQUEST["wid"].',', time()+3600*24*60);

	};
	exit();
}

if($_REQUEST["action"]=="email"){

	date_default_timezone_set ( 'Europe/Athens' );

	$host = "db30.grserver.gr";
	$user = "dbadmin";
	$pass = "52635263";


	$db_name = "fi_db";

	$dbh = new PDO("mysql:host=$host;dbname=$db_name", $user, $pass);
	$dbh->exec("SET NAMES utf8");
	$dbh->exec("SET time_zone = '+2:00'");

	$q = $dbh->prepare('select * from settings where `key` = "ContactEmail"');
	$q->execute(array(
		":id" => $_REQUEST["wid"]
	));
	$r = $q->fetchall(PDO::FETCH_ASSOC);

	mail($r[0]["value"],'EMAIL FROM SITE CLIENT "'.$_REQUEST["name"].'" ('.$_REQUEST["email"].')',$_REQUEST["message"]);
	echo json_encode(array(
		"email_to" => $r[0]["value"],
		"email_from" => $_REQUEST["email"],
		"cl_name" => $_REQUEST["name"],
		"msg" => $_REQUEST["message"]
	));
	exit();
}

if(!($_REQUEST["action"] && $_REQUEST["username"] && $_REQUEST["password"])){
	$response["status"] = "INVALID_REQUEST";
	echo json_encode($response);
	exit();
}

// Validation
// Connection
date_default_timezone_set ( 'Europe/Athens' );

//$host = "localhost";
//$user = "root";
//$pass = "48144814";

$host = "db30.grserver.gr";
$user = "dbadmin";
$pass = "52635263";


$db_name = "fi_db";

$dbh = new PDO("mysql:host=$host;dbname=$db_name", $user, $pass);
$dbh->exec("SET NAMES utf8");
$dbh->exec("SET time_zone = '+2:00'");

$q = $dbh->prepare('select * from users where username = :u and password = :p');
$q->execute(array(
	":u" => $_REQUEST["username"],
	":p" => $_REQUEST["password"]
));
$r = $q->fetchall(PDO::FETCH_ASSOC);

if(!count($r)){
	$response["status"] = "WRONG_CREDENTIALS";
	echo json_encode($response);
	exit();
}

if($_REQUEST["action"] == "login"){
	$response["status"] = "OK";
	$response["data"] = array();

	$response["data"]["categories"] = $dbh->query("select * from categories")->fetchall(PDO::FETCH_ASSOC);
	$response["data"]["categories_works"] = $dbh->query("select * from categories_works order by `index`")->fetchall(PDO::FETCH_ASSOC);
	$response["data"]["clients"] = $dbh->query("select * from clients order by `index`")->fetchall(PDO::FETCH_ASSOC);
	$response["data"]["menus"] = $dbh->query("select * from menus order by `index`")->fetchall(PDO::FETCH_ASSOC);
	$response["data"]["pages"] = $dbh->query("select * from pages order by id desc")->fetchall(PDO::FETCH_ASSOC);
	$response["data"]["settings"] = $dbh->query("select * from settings")->fetchall(PDO::FETCH_ASSOC);
	$response["data"]["users"] = $dbh->query("select * from users")->fetchall(PDO::FETCH_ASSOC);
	$response["data"]["works"] = $dbh->query("select * from works order by title")->fetchall(PDO::FETCH_ASSOC);
	$response["data"]["images"] = $dbh->query("select * from images order by id")->fetchall(PDO::FETCH_ASSOC);
}

if($_REQUEST["action"] == "delete-page"){
	$q = $dbh->prepare("delete from pages where id = :id");
	$q->execute(array(":id"=>$_REQUEST["id"]));

}

if($_REQUEST["action"] == "delete-menu"){
	$q = $dbh->prepare("delete from menus where id = :id or submenu_of = :id");
	$q->execute(array(":id"=>$_REQUEST["id"]));

}

if($_REQUEST["action"] == "delete_cat"){
	$q = $dbh->prepare("delete from categories where id = :id");
	$q->execute(array(":id"=>$_REQUEST["id"]));
	$q = $dbh->prepare("delete from categories_works where category_id = :id");
	$q->execute(array(":id"=>$_REQUEST["id"]));

}

if($_REQUEST["action"] == "delete-client"){
	$q = $dbh->prepare("delete from clients where id = :id");
	$q->execute(array(":id"=>$_REQUEST["id"]));

}

if($_REQUEST["action"] == "delete_work"){
	$q = $dbh->prepare("delete from works where id = :id");
	$q->execute(array(":id"=>$_REQUEST["id"]));

}

if($_REQUEST["action"] == "update-pages"){
	$data = json_decode($_REQUEST["data"]);
	$dbh->query("delete from pages");

	foreach($data as &$i) $dbh->prepare("insert into pages (id,title,html) values (:id,:title,:html)")->execute(array( ":id" => $i->id , ":title" => $i->title , ":html" => $i->html ));

}

if($_REQUEST["action"] == "update_settings"){
	$data = json_decode($_REQUEST["data"]);
	$dbh->prepare("
		update settings set
		`value` = :v
		where `key` = 'DefaultMenu'
	")->execute(array( ":v" => $data->DefaultMenu ));
	$dbh->prepare("
		update settings set
		`value` = :v
		where `key` = 'DefaultSubMenu'
	")->execute(array( ":v" => $data->DefaultSubMenu ));
	$dbh->prepare("
		update settings set
		`value` = :v
		where `key` = 'ContactSuccessMessage'
	")->execute(array( ":v" => $data->ContactSuccessMessage ));
	$dbh->prepare("
		update settings set
		`value` = :v
		where `key` = 'ContactFailureMessage'
	")->execute(array( ":v" => $data->ContactFailureMessage ));
	$dbh->prepare("
		update settings set
		`value` = :v
		where `key` = 'ContactEmail'
	")->execute(array( ":v" => $data->ContactEmail ));

	$q = $dbh->query("select * from settings");
	$r = $q->fetchall(PDO::FETCH_ASSOC);
	$response["data"] = $r;
	$response["rdata"] = $data;
}

if($_REQUEST["action"] == "update_works"){
	$i = json_decode($_REQUEST["data"]);

	if($_REQUEST["type"] == "insert")
	$dbh->prepare("insert into works (id,title,html,image_id,client_id) values (:id,:title,:html,:iid,:cid)")->execute(array( ":id" => $i->id , ":title" => $i->title , ":html" => $i->html , ":iid" => $i->image_id , ":cid" => $i->client_id ));
	else if($_REQUEST["type"]=="update")
	$dbh->prepare("update works set title = :title , html = :html , image_id = :iid , client_id = :cid where id = :id")->execute(array( ":id" => $i->id , ":title" => $i->title , ":html" => $i->html , ":iid" => $i->image_id , ":cid" => $i->client_id ));

	$q = $dbh->query("select * from works order by title");
	$r = $q->fetchall(PDO::FETCH_ASSOC);
	$response["data"] = $r;
}

if($_REQUEST["action"] == "update_cw"){
	$i = json_decode($_REQUEST["data"]);
	$cw = json_decode($_REQUEST["cw"]);

	if($_REQUEST["type"] == "insert")
	$dbh->prepare("insert into categories (id,title) values (:id,:title)")->execute(array( ":id" => $i->id , ":title" => $i->title ));
	else if($_REQUEST["type"]=="update")
	$dbh->prepare("update categories set title = :title where id = :id")->execute(array( ":id" => $i->id , ":title" => $i->title ));

	$dbh->prepare("delete from categories_works where category_id = :id")->execute(array( ":id" => $i->id ));

	foreach($cw as &$c) $dbh->prepare("insert into categories_works (category_id,work_id,`index`) values (:cid,:wid,:index)")->execute(array( ":cid" => $i->id , ":wid" => $c->work_id , ":index" => $c->index));

	$q = $dbh->query("select * from categories order by title");
	$r = $q->fetchall(PDO::FETCH_ASSOC);
	$response["data"] = $r;

	$q = $dbh->query("select * from categories_works order by `index`");
	$r = $q->fetchall(PDO::FETCH_ASSOC);
	$response["cw"] = $r;
}

if($_REQUEST["action"] == "update-clients"){
	$data = json_decode($_REQUEST["data"]);
	$dbh->query("delete from clients");

	foreach($data as &$i) $dbh->prepare("insert into clients (id,title,`index`,thumbnail_id,thumbnail_baw_id) values (:id,:title,:index,:tid,:tidbaw)")->execute(array( ":id" => $i->id , ":title" => $i->title , ":index" => $i->index , ":tid" => $i->thumbnail_id , ":tidbaw" => $i->thumbnail_baw_id  ));

}

if($_REQUEST["action"] == "update-menus"){
	$data = json_decode($_REQUEST["data"]);
	$dbh->query("delete from menus");

	foreach($data as &$i) $dbh->prepare("
	insert into menus
	(id,title,page_id,category_id,`type`,isHidden,`index`,submenu_of) values
	(:id,:title,:pid,:cid,:tid,:hid,:ind,:sof)")->execute(array(
	":id" => $i->id ,
	":title" => $i->title ,
	":pid" => $i->page_id ,
	":cid" => $i->category_id ,
	":tid" => $i->type ,
	":hid" => $i->isHidden ,
	":ind" => $i->index,
	":sof" => $i->submenu_of ));

	$response["data"] = $data;

}

if($_REQUEST["action"] == "update-clients-HTML"){
	$data = json_decode($_REQUEST["data"]);

	foreach($data as &$i) $dbh->prepare("update works set `index` = :i where id = :id")->execute(array( ":id" => $i->id , ":i" => $i->index ));
	$dbh->prepare("update clients set `html` = :html where id = :id")->execute(array(":html"=>$_REQUEST["html"],":id"=>$_REQUEST["cid"]));
	$q1 = $dbh->query("select * from works order by `title`");
	$q2 = $dbh->query("select * from clients order by `index`");
	$response["works"] = $q1->fetchall(PDO::FETCH_ASSOC);
	$response["clients"] = $q2->fetchall(PDO::FETCH_ASSOC);

}

// Delete images
if($_REQUEST['action']=="delete_images"){
		$imgs = json_decode($_REQUEST["data"]);

		foreach($imgs as &$i){
			unlink('../'.$i->src);
			$dbh->query("delete from images where id = ".$i->id."");
		}
}

if($_REQUEST['action']=="multiple_image_upload"){
		$response["files"] = array();
		foreach($_FILES as &$value){

			$q = $dbh->query("insert into images (`src`) values ('');");
			$x = $dbh->query("select max(id) from images;");
			$r = $x->fetchall();

			$id = $r[0][0];
			$target = "../upl/";
			$filename = $id.".".array_pop(explode('.',$value["name"]));

			$c = $dbh->prepare("update images set `src` = :filename where id = :id");
			$c->execute(array( ":id" => $id, ":filename" => "upl/".$filename ));

			array_push($response["files"],array( "id" => $id, "src" => "upl/".$filename ));

			move_uploaded_file( $value["tmp_name"], $target.$filename );

		}
}

echo json_encode($response);
exit();

?>