/**
 * TRINITI FileOps Demo Route
 *
 * Route for showcasing TRINITI's file system operations
 */

import { FileOpsDemo } from '../components/FileOpsDemo';

export default function FileOpsRoute() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <FileOpsDemo />
      </div>
    </div>
  );
}
