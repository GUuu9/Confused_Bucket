import { RendererRegistry } from './core/di/registry.js';
import { container } from './core/di/container.renderer.js';
import { NavController } from './core/navigation/nav.controller.js';

async function bootstrap() {
  console.log('[Frontend] Initializing MVVM Architecture...');

  // 1. Registry 초기화 (컨테이너 채우기)
  RendererRegistry.init();

  // 2. 컨테이너에서 서비스 가져오기
  const navController = container.get<NavController>('NavController');
  
  navController.init();

}

window.addEventListener('DOMContentLoaded', bootstrap);
