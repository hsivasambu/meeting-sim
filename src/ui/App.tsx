import { shellCopy } from '../core/content/copy';

export function App() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-lg space-y-4">
        <h1 className="text-3xl font-bold">{shellCopy.title}</h1>
        <p className="text-base">{shellCopy.objective}</p>
      </div>
    </main>
  );
}
