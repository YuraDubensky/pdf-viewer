import { Component, h, ComponentDidLoad } from '@stencil/core';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as pdfjsViewer from 'pdfjs-dist/legacy/web/pdf_viewer';

@Component({
  tag: 'my-component',
  styleUrls: ['my-component.css'],
  shadow: false,
  assetsDirs: ['assets'],
})
export class MyComponent implements ComponentDidLoad {
  componentDidLoad(): void {
    if (!pdfjsLib.getDocument || !pdfjsViewer.PDFViewer) {
      // eslint-disable-next-line no-alert
      alert('Please build the pdfjs-dist library using\n  `gulp dist-install`');
    }

    // The workerSrc property shall be specified.
    //
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/build/assets/pdfjs-dist/build/pdf.worker.js';

    // Some PDFs need external cmaps.
    //
    const CMAP_URL = '/build/assets/pdfjs-dist/cmaps/';
    const CMAP_PACKED = true;

    const DEFAULT_URL = '/build/assets/compressed.tracemonkey-pldi-09.pdf';
    // To test the AcroForm and/or scripting functionality, try e.g. this file:
    // "../../test/pdfs/160F-2019.pdf"
    const SANDBOX_BUNDLE_SRC = '/build/assets/pdfjs-dist/build/pdf.sandbox.js';
    const ENABLE_XFA = true;
    const SEARCH_FOR = ''; // try "Mozilla";

    const container = document.getElementById('viewerContainer');

    const eventBus = new pdfjsViewer.EventBus();

    // (Optionally) enable hyperlinks within PDF files.
    const pdfLinkService = new pdfjsViewer.PDFLinkService({
      eventBus,
    });

    // (Optionally) enable find controller.
    const pdfFindController = new pdfjsViewer.PDFFindController({
      eventBus,
      linkService: pdfLinkService,
    });

    // (Optionally) enable scripting support.
    const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
      eventBus,
      sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
    });

    const pdfViewer = new pdfjsViewer.PDFViewer({
      container: container as any,
      eventBus,
      linkService: pdfLinkService,
      findController: pdfFindController,
      scriptingManager: pdfScriptingManager,
    } as any);
    pdfLinkService.setViewer(pdfViewer);
    pdfScriptingManager.setViewer(pdfViewer);

    eventBus.on('pagesinit', function () {
      // We can use pdfViewer now, e.g. let's change default scale.
      pdfViewer.currentScaleValue = 'page-width';

      // We can try searching for things.
      if (SEARCH_FOR) {
        if (!pdfFindController['_onFind']) {
          pdfFindController.executeCommand('find', { query: SEARCH_FOR });
        } else {
          eventBus.dispatch('find', { type: '', query: SEARCH_FOR });
        }
      }
    });

    // Loading document.
    const loadingTask = pdfjsLib.getDocument({
      url: DEFAULT_URL,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED,
      enableXfa: ENABLE_XFA,
    });
    (async function () {
      const pdfDocument = await loadingTask.promise;
      // Document loaded, specifying document for the viewer and
      // the (optional) linkService.
      pdfViewer.setDocument(pdfDocument);

      pdfLinkService.setDocument(pdfDocument, null);
    })();
  }

  render() {
    return (
      <div id="viewerContainer">
        <div id="viewer" class="pdfViewer"></div>
      </div>
    );
  }
}
