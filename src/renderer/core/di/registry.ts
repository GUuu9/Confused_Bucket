import { container } from './container.renderer.js';

// Shared Services
import { TranslationService } from '../../../shared/i18n/i18n.service.js';

// Repositories
import { FileRepository } from '../../data/file/file.repository.js';
import { HttpRepository } from '../../data/network/http.repository.js';
import { CompressRepository } from '../../data/security/compress.repository.js';
import { CryptoRepository } from '../../data/security/crypto.repository.js';
import { StorageRepository } from '../../data/storage/storage.repository.js';

// ViewModels
import { StockViewModel } from '../../features/stock/stock.viewmodel.js';
// Views & Binders
import { StockView, StockBinder } from '../../features/stock/stock.view.js';

// Core
import { Navigator } from '../navigation/navigator.js';
import { NavController } from '../navigation/nav.controller.js';

/**
 * RendererRegistry (Composition Root)
 */
export class RendererRegistry {
  public static init() {
    // 1. Data Layer
    const translationService = new TranslationService();

    container.register('TranslationService', translationService);
    
    container.register('FileRepository', new FileRepository());
    container.register('httpRepository', new HttpRepository());
    container.register('compressRepository', new CompressRepository());
    container.register('cryptoRepository', new CryptoRepository());
    container.register('StorageRepository', new StorageRepository());
    
    // 2. ViewModel Layer
    container.register('StockViewModel', new StockViewModel(
        container.get('httpRepository'), 
        container.get('FileRepository'), 
        container.get('compressRepository'), 
        container.get('cryptoRepository'), // 수정됨
        container.get('StorageRepository')
    ));

    
    // 3. View & Binder Layer
    const stockView = new StockView(container.get('StockViewModel'));
    container.register('StockBinder', new StockBinder(stockView, container.get('StockViewModel')));
    
    // 4. Navigation Layer
    const navigator = new Navigator();
    const navController = new NavController(navigator, { 
      stockView,
    });
    
    container.register('Navigator', navigator);
    container.register('NavController', navController);
  }
}
