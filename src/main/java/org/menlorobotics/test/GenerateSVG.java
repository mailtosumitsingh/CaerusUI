package org.menlorobotics.test;

import java.util.List;

import org.menlorobotics.utils.CommonUtils;

public class GenerateSVG {
	public static void main(String[] args) throws Exception{
		String fname = "C:\\Users\\singh\\Desktop\\diagrams\\arrow1.png";
		List<String> svg = CommonUtils.extractSVG(fname);
		System.out.println(svg);
	}
}
