
package com.maxxton.microdocs.crawler.doclet_old;

import com.sun.javadoc.AnnotationDesc;
import com.sun.javadoc.ClassDoc;

/**
 * @author hermans.s
 */
public interface Collector {

    public default void postProcess(){}

    public void processClass(ClassDoc classDoc, AnnotationDesc[] annotations);

}
