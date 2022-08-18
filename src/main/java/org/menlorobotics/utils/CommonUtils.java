package org.menlorobotics.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.exec.CommandLine;
import org.apache.commons.exec.DefaultExecutor;
import org.apache.commons.exec.ExecuteException;
import org.apache.commons.exec.PumpStreamHandler;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.StringUtils;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;

import net.htmlparser.jericho.Element;
import net.htmlparser.jericho.Source;

public class CommonUtils {
	public static final String readFileFromRes(String name) throws Exception {
		URL url = Resources.getResource(name);
		String text = Resources.toString(url, Charsets.UTF_8);
		return text;
	}

	// mkbitmap -f 2 -s 2 -t 0.48
	public static void mkbitmap(String fname) throws ExecuteException, IOException {
		String out = StringUtils.substringBeforeLast(fname, ".");
		String cmd = "C:/projects/CaerusonePlugins/ImageFilters/native/image/mkbitmap -f 2 -t 0.48 " + fname + " -o " + out + ".bmp";
		String[] o = CommonUtils.runCmd(cmd, "c:\\temp");
	}

	// /C:\projects\CaerusonePlugins\ImageFilters\native\image\potrace.exe"
	public static void convertToBMP256(String fname) throws ExecuteException, IOException {
		String out = StringUtils.substringBeforeLast(fname, ".");
		String cmd = "c:/PROGRA~2/GraphicsMagick-1.3.30-Q16/gm.exe convert -colors 256 " + fname + " " + out + ".bmp";
		String[] o = CommonUtils.runCmd(cmd, "c:\\temp");
	}

	public static void convertToSvg(String fname) throws ExecuteException, IOException {
		String out = StringUtils.substringBeforeLast(fname, ".");
		String cmd = "C:/projects/CaerusonePlugins/ImageFilters/native/image/potrace.exe -t 5 -s " + out + ".bmp -o " + out + ".svg";
		String[] o = CommonUtils.runCmd(cmd, "c:\\temp");
	}

	public static List<String> extractSVG2(String fname) throws ExecuteException, IOException {
		mkbitmap(fname);
		convertToSvg(fname);
		String out = StringUtils.substringBeforeLast(fname, ".");
		String svg = out + ".svg";
		return extractSVGPaths(svg);
	}

	public static List<String> extractSVG(String fname) throws ExecuteException, IOException {
		convertToBMP256(fname);
		convertToSvg(fname);
		String out = StringUtils.substringBeforeLast(fname, ".");
		String svg = out + ".svg";
		return extractSVGPaths(svg);
	}

	public static String[] runCmd(String line,String wdir) throws ExecuteException, IOException{
		System.out.println("Running: "+line);
		String[] ret = new String[3];		
		int exitValue =   -1;
		CommandLine cmdLine = CommandLine.parse(line);
		DefaultExecutor executor = new DefaultExecutor();
		String random = RandomStringUtils.randomAlphanumeric(8);
		String outfile = "c:\\projects\\temp\\" + random + ".tmp";
		String errfile = "c:\\projects\\temp\\" + "err_" + random + ".tmp";
		FileOutputStream stdout = new FileOutputStream(new File(outfile));
		FileOutputStream stderr = new FileOutputStream(new File(errfile));
        PumpStreamHandler handler = new PumpStreamHandler(stdout,stderr);
		executor.setStreamHandler(handler);
		executor.setWorkingDirectory(new File(wdir));
		exitValue = executor.execute(cmdLine);
		stdout.flush();
		stdout.close();
		stderr.flush();
		stderr.close();
		ret[0] = ""+exitValue;
		ret[1] = outfile;
		ret[2] = errfile;
		return ret;
	}

	/////////// image utils
	public static List<String> extractSVGPaths(String fname) throws IOException, FileNotFoundException {
		List<String> paths = new LinkedList<String>();
		Source source = new Source(IOUtils.toString(new FileInputStream(fname)));
		List<Element> a = source.getAllElements("path");
		for (Element e : a) {
			String path = e.getAttributeValue("d");
			System.out.println(path);
			paths.add(path);
		}
		return paths;
	}
}
