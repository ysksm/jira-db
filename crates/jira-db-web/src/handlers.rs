//! HTTP request handlers
//!
//! Each handler wraps the corresponding service function.

use std::convert::Infallible;
use std::sync::Arc;

use actix_web::{HttpResponse, web};
use serde::Deserialize;

use jira_db_service::{self as service, AppState, SyncProgress};

use crate::error::ApiError;

type Result<T> = std::result::Result<T, ApiError>;

// ============================================================
// Config Handlers
// ============================================================

pub async fn config_get(
    state: web::Data<Arc<AppState>>,
    _request: web::Json<service::ConfigGetRequest>,
) -> Result<HttpResponse> {
    let response = service::config::get(&state)?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn config_update(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::ConfigUpdateRequest>,
) -> Result<HttpResponse> {
    let response = service::config::update(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn config_initialize(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::ConfigInitRequest>,
) -> Result<HttpResponse> {
    let response = service::config::initialize(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

// ============================================================
// Projects Handlers
// ============================================================

pub async fn projects_list(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::ProjectListRequest>,
) -> Result<HttpResponse> {
    let response = service::projects::list(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn projects_initialize(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::ProjectInitRequest>,
) -> Result<HttpResponse> {
    let response = service::projects::initialize(&state, request.into_inner()).await?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn projects_enable(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::ProjectEnableRequest>,
) -> Result<HttpResponse> {
    let response = service::projects::enable(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn projects_disable(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::ProjectDisableRequest>,
) -> Result<HttpResponse> {
    let response = service::projects::disable(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

// ============================================================
// Sync Handlers
// ============================================================

pub async fn sync_execute(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::SyncExecuteRequest>,
) -> Result<HttpResponse> {
    let response = service::sync::execute(&state, request.into_inner()).await?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn sync_status(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::SyncStatusRequest>,
) -> Result<HttpResponse> {
    let response = service::sync::status(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

/// SSE query parameters for sync streaming
#[derive(Debug, Deserialize)]
pub struct SyncStreamQuery {
    #[serde(rename = "projectKey")]
    pub project_key: Option<String>,
    pub force: Option<bool>,
}

/// SSE streaming endpoint for sync progress
pub async fn sync_execute_stream(
    state: web::Data<Arc<AppState>>,
    query: web::Query<SyncStreamQuery>,
) -> HttpResponse {
    let request = service::SyncExecuteRequest {
        project_key: query.project_key.clone(),
        force: query.force,
    };

    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<SyncProgress>();

    let state_clone = state.get_ref().clone();

    // Spawn the sync task in the background
    let sync_handle = tokio::spawn(async move {
        service::sync::execute_with_progress(&state_clone, request, Some(tx)).await
    });

    // Create SSE stream
    let event_stream = async_stream::stream! {
        // Yield progress events as they arrive
        while let Some(progress) = rx.recv().await {
            let data = serde_json::to_string(&progress).unwrap_or_default();
            yield Ok::<_, Infallible>(
                web::Bytes::from(format!("event: progress\ndata: {}\n\n", data))
            );
        }

        // After all progress events, yield the final result
        match sync_handle.await {
            Ok(Ok(response)) => {
                let data = serde_json::to_string(&response).unwrap_or_default();
                yield Ok::<_, Infallible>(
                    web::Bytes::from(format!("event: complete\ndata: {}\n\n", data))
                );
            }
            Ok(Err(e)) => {
                let error_json = serde_json::json!({ "error": e.to_string() });
                yield Ok::<_, Infallible>(
                    web::Bytes::from(format!("event: error\ndata: {}\n\n", error_json))
                );
            }
            Err(e) => {
                let error_json = serde_json::json!({ "error": e.to_string() });
                yield Ok::<_, Infallible>(
                    web::Bytes::from(format!("event: error\ndata: {}\n\n", error_json))
                );
            }
        }
    };

    HttpResponse::Ok()
        .content_type("text/event-stream")
        .insert_header(("Cache-Control", "no-cache"))
        .insert_header(("Connection", "keep-alive"))
        .insert_header(("X-Accel-Buffering", "no"))
        .streaming(event_stream)
}

// ============================================================
// Issues Handlers
// ============================================================

pub async fn issues_search(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::IssueSearchRequest>,
) -> Result<HttpResponse> {
    let response = service::issues::search(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn issues_get(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::IssueGetRequest>,
) -> Result<HttpResponse> {
    let response = service::issues::get(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn issues_history(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::IssueHistoryRequest>,
) -> Result<HttpResponse> {
    let response = service::issues::history(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

// ============================================================
// Metadata Handlers
// ============================================================

pub async fn metadata_get(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::MetadataGetRequest>,
) -> Result<HttpResponse> {
    let response = service::metadata::get(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

// ============================================================
// Embeddings Handlers
// ============================================================

pub async fn embeddings_generate(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::EmbeddingsGenerateRequest>,
) -> Result<HttpResponse> {
    let response = service::embeddings::generate(&state, request.into_inner()).await?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn embeddings_search(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::SemanticSearchRequest>,
) -> Result<HttpResponse> {
    let response = service::embeddings::search(&state, request.into_inner()).await?;
    Ok(HttpResponse::Ok().json(response))
}

// ============================================================
// Reports Handlers
// ============================================================

pub async fn reports_generate(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::ReportGenerateRequest>,
) -> Result<HttpResponse> {
    let response = service::reports::generate(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

// ============================================================
// SQL Handlers
// ============================================================

pub async fn sql_execute(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::SqlExecuteRequest>,
) -> Result<HttpResponse> {
    let response = service::sql::execute(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn sql_get_schema(
    state: web::Data<Arc<AppState>>,
    request: web::Json<service::SqlGetSchemaRequest>,
) -> Result<HttpResponse> {
    let response = service::sql::get_schema(&state, request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn sql_query_list(
    _state: web::Data<Arc<AppState>>,
    request: web::Json<service::SqlQueryListRequest>,
) -> Result<HttpResponse> {
    let response = service::sql::query_list(request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn sql_query_save(
    _state: web::Data<Arc<AppState>>,
    request: web::Json<service::SqlQuerySaveRequest>,
) -> Result<HttpResponse> {
    let response = service::sql::query_save(request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}

pub async fn sql_query_delete(
    _state: web::Data<Arc<AppState>>,
    request: web::Json<service::SqlQueryDeleteRequest>,
) -> Result<HttpResponse> {
    let response = service::sql::query_delete(request.into_inner())?;
    Ok(HttpResponse::Ok().json(response))
}
