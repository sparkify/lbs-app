import {ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Inject, Injectable, Injector} from '@angular/core';
import {UploadFeatureComponent} from '../home/features/upload-feature/upload-feature.component';

interface DynamicComponent {
  id: string;
  component: any;
}

@Injectable({
  providedIn: 'root'
})
export class DynamicComponentService {
  private rootViewContainer: any;

  constructor(private factoryResolver: ComponentFactoryResolver,
              private appRef: ApplicationRef,
              private injector: Injector) {}

  // setRootViewContainerRef(viewContainerRef) {
  //   this.rootViewContainer = viewContainerRef;
  // }
  // addDynamicComponent(identifier: string) {
  //   let theC: any = null;
  //   switch (identifier) {
  //     case 'upload':
  //       theC = UploadFeatureComponent;
  //       break;
  //   }
  //
  //   const factory = this.factoryResolver.resolveComponentFactory(theC);
  //
  //   const component = factory.create(this.rootViewContainer.parentInjector);
  //   this.rootViewContainer.insert(component.hostView);
  // }

  addComponentToId(component: any, htmlId: string): DynamicComponent {
    // Create component reference
    const componentRef = this.factoryResolver
        .resolveComponentFactory(component)
        .create(this.injector);

    // Attach component to the appRef so that it is inside the ng component tree
    this.appRef.attachView(componentRef.hostView);

    // Get DOM element from component
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    // Append DOM element to element respective to ID
    document.getElementById(htmlId).appendChild(domElem);
    // document.body.appendChild(domElem);

    // return the component ref for further processing
    return {
      id: 'uno',
      component: componentRef
    };
  }

  removeComponent(componentRef): void {
    // Wait some time and remove it from the component tree and from the DOM
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
}
