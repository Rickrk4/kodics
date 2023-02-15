<?php
namespace App\Lib;

//use \App\Lib\BookGluttonEpub\BookGluttonEpub;
use ZipArchive;
use RarArchive;
//use Imagick;
use Jcupitt\Vips;

class Archiver {
    protected string $x;
    protected static $supported_types = ['application/zip', 'application/epub+zip', 'application/x-rar', 'application/pdf'];
    protected $image_width = 1080;
    public static function support($file)
    {
        $ext = mime_content_type($file);
        return in_array($ext, Archiver::$supported_types);


    }
    private function extractRarIn(string $file, string $folder, $callback = null)
    {
        $archive = RarArchive::open($file);
        $entries = $archive->getEntries();
        foreach ($entries as $i => $entry) {
            $entry->extract($folder);
            if($callback != null)
                $callback($i, $entry->getName());
        }
        $archive->close();
        return 1;
    }
    
    //TODO: set filename for extracted file
    //     see https://www.php.net/manual/en/rarentry.extract.php
    private function extractFirstRarIn(string $file, string $folder)
    {
        $archive = RarArchive::open($file);
        $entries = $archive->getEntries();
        $i=0;
        do {
            $entry = $entries[$i++];
        }while(!Archiver::is_image($entry->getName()));
        $entry->extract($folder);
        $archive->close();
        return 1;
    }

    private function extractZipIn(string $file, string $folder)
    {
        $zip = new ZipArchive;
        $res = $zip->open($file);
        if ($res === TRUE) {
            $zip->extractTo($folder);
            $zip->close();
        } else {
            return $res;
        }
    }
    
    private function extractZipOneByOneIn(string $file, string $folder, $callback=null)
    {
        $zip = new ZipArchive;
        $res = $zip->open($file);
        if ($res === TRUE) {
            for ($i = 0; $i < $zip -> numFiles; $i++){
                $filename = $zip->getNameIndex($i);
                $zip->extractTo($folder,$filename);
                if($callback != null) 
                    $callback($i, $filename);
            }
            $zip->extractTo($folder);
            $zip->close();
        } else {
            return $res;
        }
    }

    private function extractFirstZipIn(string $file, string $folder)
    {
        $zip = new ZipArchive;
        $res = $zip->open($file);
        
        if ($res === TRUE) {
            $i=0;
            do {
                $filename = $zip->getNameIndex($i++);
            }while(!Archiver::is_image($filename));
            #$filename = $zip->getNameIndex(0);
            return $zip->extractTo($folder, $filename);
            $zip->close();
        } else {
            return $res;
        }
    }
    
    public function extractFirstZipInto(string $in, string $out)
    {
        $zip = new ZipArchive;
        if ($res = $zip->open($in)) {
            $filename = $zip->getNameIndex(0);
            copy("zip://".$in."#".$filename, $out);
            $zip->close();
            return TRUE;
        } else {
            return $res;
        }
    }
    private function extractPdfIn(string $file, string $folder, $callback = null) {
        if(!file_exists($folder)){
            mkdir($folder);
        }
        $n_pages = Vips\Image::newFromFile($file)->get("n-pages");
        for ($i = 0; $i < $n_pages; $i++) {
            Vips\Image::newFromFile($file, [
              "dpi" => 30,
              "page" => $i,
            ])->writeToFile("$folder/$i.png");
            $callback && $callback($i, "$i.png");
        }
    }
    
    private function extractFirstPdfIn(string $in, string $out){
        Vips\Image::newFromFile($in, ["dpi" => 30, "page" => 0])->writeToFile($out);
        return $out;
        
    }

    private function getEpubCover($zip, $cover)
    {
        $im_string = '';
        foreach (['png', 'jpg', 'jpeg'] as $ext) 
            $im_string = $im_string != '' ? $im_string : $zip->getFromName($cover.'.'.$ext);
        return $im_string;
        
    }
    
    public function is_image($filename): bool{
        return array_key_exists('extension', pathinfo($filename)) &&  in_array(strtolower(pathinfo($filename)['extension']), ['jpg', 'jpeg', 'png', 'webp']);
    }

    public function extractEpubCoverIn(string $book, string $cover_path)
    {
        if (($zip = new ZipArchive) && $zip->open($book)){
            try { 
                $i = 0;
                do {
                   $filename = $zip->getNameIndex($i++);
                } while ($filename && !$this->is_image($filename));
                $cover_path = $cover_path . "/" . uniqid() . "." . pathinfo($filename)['extension'];
                $zip->extractTo("/tmp/cover/", $filename) && rename("/tmp/cover/$filename", $cover_path);
            } catch (\Exception $e) {
                return null;
            }
            $zip->close();
        }
        return $cover_path;
    }

    public function __construct(string $x) {
        $this->x = $x;
    }

    public static function open(string $x)
    {
       return new Archiver($x);
    }



    public function extractAllIn(string $folder = null, $callback = null)
    {
        $ext = mime_content_type($this->x);
        switch ($ext) {
            case 'application/zip':
                return $this->extractZipOneByOneIn($this->x, $folder, $callback);
                break;
                
            case 'application/x-rar':
                return $this->extractRarIn($this->x, $folder, $callback);
                break;

            case 'application/pdf':
                return $this->extractPdfIn($this->x, $folder, $callback);
                break;

            default:
                return $ext . ' not supported';
                break;
        }
    }

    public function extractFirstIn(string $folder = null)
    {
        $ext = mime_content_type($this->x);
        if ($ext == 'application/zip' && pathinfo($this->x)['extension'] == 'epub')
            $ext = 'application/epub+zip';
        switch ($ext) {
            case 'application/zip':
                return $this->extractFirstZipIn($this->x, $folder);
                break;
                
            case 'application/x-rar':
                return $this->extractFirstRarIn($this->x, $folder);
                break;

            case 'application/pdf':
                return $this->extractFirstPdfIn($this->x, "$folder/".uniqid().".png");
                break;

            case 'application/epub+zip':
                return $this->extractEpubCoverIn($this->x, $folder);
                break;
            
            default:
                return $ext . ' not supported';
                break;
        }
    }
    
    public function extractFirstInto(string $folder = null)
    {
        $ext = mime_content_type($this->x);
        if ($ext == 'application/zip' && pathinfo($this->x)['extension'] == 'epub')
            $ext = 'application/epub+zip';
        switch ($ext) {
            case 'application/zip':
                $res = $this->extractFirstZipIn($this->x, $folder);
                break;
                
            case 'application/x-rar':
                $res = $this->extractFirstRarIn($this->x, $folder);
                break;

            case 'application/pdf':
                $res = $this->extractFirstPdfIn($this->x, "$folder/".uniqid().".png");
                break;

            case 'application/epub+zip':
                $res = $this->extractEpubCoverIn($this->x, $folder);
                break;
            
            default:
                return $ext . ' not supported';
                break;
        }
        if(!$res)
            return $res;
        
    }

    public function getExt()
    {
        return mime_content_type($this->x);
    }
}

?>

