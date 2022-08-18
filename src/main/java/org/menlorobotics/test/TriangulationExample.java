package org.menlorobotics.test;

import java.util.ArrayList;
import java.util.Collection;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryCollection;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.triangulate.DelaunayTriangulationBuilder;
import org.locationtech.jts.triangulate.quadedge.QuadEdgeSubdivision;

public class TriangulationExample {
	public static void main(String[] args) {
		GeometryFactory geometryFactory = new GeometryFactory();

		Collection<Geometry> geometries = new ArrayList<Geometry>();
		geometries.add(geometryFactory.createPoint(new Coordinate(10, 20)));
		geometries.add(geometryFactory.createPoint(new Coordinate(40, 40)));
		geometries.add(geometryFactory.createPoint(new Coordinate(30, 20)));

		GeometryCollection inputGeometries = new GeometryCollection(geometries.toArray(new Geometry[0]), geometryFactory);

		DelaunayTriangulationBuilder builder = new DelaunayTriangulationBuilder();
		builder.setSites(inputGeometries);

		QuadEdgeSubdivision subdivision = builder.getSubdivision();
		Geometry delaunay = subdivision.getTriangles(geometryFactory);
		Geometry voronoi = subdivision.getVoronoiDiagram(geometryFactory);

		System.out.println(delaunay.toText());
		for (int i=0;i<delaunay.getNumGeometries();i++) {
			System.out.println(delaunay.getGeometryN(i));
			
		}
		//System.out.println(voronoi.toText());
	}
}