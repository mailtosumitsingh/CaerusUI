package org.menlorobotics.handlers;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Controller
public class SiteHandler {
	@Value("${application.message:Hello World}")
	private String message = "Hello World";

	@RequestMapping("/jsp/*")
	public String welcome(Map<String, Object> model) {
		model.put("time", new Date());
		model.put("message", this.message);
		return "welcome";
	}
	@RequestMapping("/shape/*")
	public String layout(Map<String, Object> model) {
		model.put("time", new Date());
		model.put("message", this.message);
		return "shape";
	}

	@RequestMapping("/wide/*")
	public String d3d(Map<String, Object> model) {
		model.put("time", new Date());
		model.put("message", this.message);
		return "sds"; 
	}
	@PostMapping("/saveshapetemplate")
	public @ResponseBody String save(HttpServletRequest model) throws IOException {
		String name = (String) model.getParameter("name");
		String design = (String) model.getParameter("design");
		ObjectMapper mapper = new ObjectMapper();
	    JsonNode obj = mapper.readTree(design);
	    JsonNode data = obj.get("data");
	    if (data.isArray()) {
	        for (final JsonNode objNode : data) {
	            String compName = objNode.get("compName").asText();
				System.out.println(compName);
	        	FileUtils.writeStringToFile(new File("src/main/resources/shapetemplates/"+compName+".json"), objNode.toString());
	        }
	    }
		return "saved"; 
	}
	@PostMapping("/savedesign")
	public @ResponseBody String saveDesign(HttpServletRequest model) throws IOException {
		String name = (String) model.getParameter("name");
		String design = (String) model.getParameter("design");
	   FileUtils.writeStringToFile(new File("src/main/resources/designs/"+name+".json"), design);
		return "saved"; 
	}
	@GetMapping("/getshapetemplate")
	public @ResponseBody String getTemplate(HttpServletRequest model) throws IOException {
		String name = (String) model.getParameter("name");
		String data = FileUtils.readFileToString(new File("src/main/resources/shapetemplates/"+name+".json"));
		return data;
	}
	@GetMapping("/getdesign")
	public @ResponseBody String getDesign(HttpServletRequest model) throws IOException {
		String name = (String) model.getParameter("name");
		String data = FileUtils.readFileToString(new File("src/main/resources/designs/"+name+".json"));
		return data;
	}
		@RequestMapping(value = "/getConfig")
	public @ResponseBody String getConfig( HttpServletRequest req)throws Exception {
		String id = (String) req.getParameter("id");
		String name = (String) req.getParameter("name");
		ClassPathResource classPathResource = new ClassPathResource("/templates/comps/web.html");
		InputStream inputStream = classPathResource.getInputStream();
		String s  = IOUtils.toString(inputStream);
		s = org.apache.commons.lang3.StringUtils.replace(s, "{id}", id);
		s = org.apache.commons.lang3.StringUtils.replace(s, "{name}", name);
		return s;
	}
}
