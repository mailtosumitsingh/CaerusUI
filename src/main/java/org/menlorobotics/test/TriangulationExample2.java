package org.menlorobotics.test;

import java.util.ArrayList;
import java.util.List;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.triangulate.DelaunayTriangulationBuilder;
import org.locationtech.jts.triangulate.quadedge.QuadEdgeSubdivision;

public class TriangulationExample2 {
	public static void main(String[] args) {
		GeometryFactory geometryFactory = new GeometryFactory();

		List<Coordinate> geometries = new ArrayList<Coordinate>();
		geometries.add(new Coordinate(10, 20));
		geometries.add(new Coordinate(40, 40));
		geometries.add(new Coordinate(30, 50));
		geometries.add(new Coordinate(10, 20));
		//Polygon p = geometryFactory.createPolygon(geometries.toArray(new Coordinate[0]));
		
		DelaunayTriangulationBuilder builder = new DelaunayTriangulationBuilder();
		builder.setSites(geometries);

		QuadEdgeSubdivision subdivision = builder.getSubdivision();
		Geometry delaunay = subdivision.getTriangles(geometryFactory);

		System.out.println(delaunay.toText());

		//System.out.println(voronoi.toText());
	}
}