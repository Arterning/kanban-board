import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type FeatureCard = {
  id: number;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  path: string;
};

type Testimonial = {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
};

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const navigate = useNavigate();

  const features: FeatureCard[] = [
    {
      id: 1,
      title: '工作看板',
      description: '直观的任务管理面板，轻松跟踪项目进度',
      icon: '📊',
      bgColor: 'bg-blue-100',
      path: '/kanban',
    },
    {
      id: 2,
      title: '实用工具',
      description: '集成多种日常工具，提高工作效率',
      icon: '🛠️',
      bgColor: 'bg-green-100',
      path: '/tools',
    },
    {
      id: 3,
      title: '智能便签',
      description: '随时记录灵感，多设备同步',
      icon: '📝',
      bgColor: 'bg-yellow-100',
      path: '/notes',
    },
    {
      id: 4,
      title: '密码管理',
      description: '安全存储您的所有密码，一键登录',
      icon: '🔒',
      bgColor: 'bg-purple-100',
      path: '/password-generator',
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: '张伟',
      role: '产品经理',
      content: '这个平台彻底改变了我的工作方式，无需登录的特性太方便了，而且数据安全性让我完全放心。',
      avatar: '👨‍💼',
    },
    {
      id: 2,
      name: '李娜',
      role: '设计师',
      content: '便签和工作看板的结合使用让我的创意工作流程更加流畅，强烈推荐给创意工作者！',
      avatar: '👩‍🎨',
    },
    {
      id: 3,
      name: '王强',
      role: '开发者',
      content: '作为一个注重隐私的人，我欣赏他们的数据安全方案。工具集也非常实用。',
      avatar: '👨‍💻',
    },
  ];

  const handleFeatureClick = (feature: FeatureCard) => { 
    setActiveFeature(feature.id);
    void navigate(feature.path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">WorkSuite</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                首页
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                功能
              </a>
              {/* <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                定价
              </a> */}
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                立即使用
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">简单、安全、高效</span>
            <span className="block text-indigo-600">您的一站式工作平台</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            无需登录即可使用，所有数据安全加密存储，让您的工作更加轻松高效。
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <a
                href="#"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                开始使用
              </a>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <a
                href="#"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                了解更多
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 核心优势 */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">优势</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              为什么选择我们
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              我们重新定义了工作效率工具的标准
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">无需登录</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        立即开始使用，无需繁琐的注册流程，节省您宝贵的时间。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">数据安全</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        端到端加密技术，确保您的数据只有您自己能访问。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">简单高效</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        直观的界面设计，让您专注于工作本身，而不是工具。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能卡片 */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">功能</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              一站式解决您的工作需求
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              点击卡片立即体验各项功能
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  onClick={() => handleFeatureClick(feature)}
                  className={`${feature.bgColor} rounded-lg overflow-hidden shadow transform transition-all hover:scale-105 cursor-pointer ${
                    activeFeature === feature.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="text-4xl text-center mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-medium text-center text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 text-center">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 用户评价 */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">评价</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              用户怎么说
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA 区域 */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">准备好提升您的工作效率了吗？</span>
            <span className="block">立即开始使用WorkSuite。</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            无需注册，立即开始使用所有功能。您的数据将始终安全。
          </p>
          <a
            href="#"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            免费使用
          </a>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                关于
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                博客
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                工作机会
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                隐私
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                条款
              </a>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2023 WorkSuite. 保留所有权利。
          </p>
        </div>
      </footer>
    </div>
  );
}